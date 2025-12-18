import json
import asyncio
from redis import asyncio as aioredis
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI 
from games.data.story_images import story_images

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_redis():
    """Singleton Redis connection."""
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


class StoryChainConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"].replace(" ", "_")
        self.room_group_name = f"story_{self.room_name}"
        self.player_name = None
        self.timer_task = None 

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        self.redis = await get_redis()
        print(f"✅ Player connected to room: {self.room_name}")

    async def disconnect(self, close_code):
        # NEW: Cancel timer on disconnect
        if self.timer_task and not self.timer_task.done():
            self.timer_task.cancel()
        
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"🔌 Player disconnected from room: {self.room_name}")

    # -------------------- State Helpers --------------------

    async def get_state(self):
        data = await self.redis.get(self.room_group_name)
        return json.loads(data) if data else None

    async def save_state(self, state):
        await self.redis.set(self.room_group_name, json.dumps(state), ex=3600)

    # -------------------- Message Handling --------------------

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get("type")
            player = data.get("player")

            print(f"📨 Received {msg_type} from {player}")

            if msg_type == "player_join":
                await self.handle_player_join(player)

            elif msg_type == "submit_sentence":
                await self.handle_submit_sentence(player, data.get("text", "").strip())

        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error: {e}")
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid message format"
            }))
        except Exception as e:
            print(f"❌ Error in receive: {e}")
            import traceback
            traceback.print_exc()
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": f"Internal server error: {str(e)}"
            }))

    async def handle_player_join(self, player):
        """Handle player joining the game."""
        self.player_name = player
        state = await self.get_state()

        # Initialize new room state if it doesn't exist
        if not state:
            state = {
                "current_turn_index": 0,
                "players": [],
                "scores": {},
                "current_image_index": 0,
                "total_images": len(story_images),
                "current_sentence": [],
                "game_started": False,
            }

        # Add player if not already in
        if player not in state["players"]:
            state["players"].append(player)
            state["scores"][player] = 0
            await self.save_state(state)

            print(f"✅ Player {player} joined. Total players: {len(state['players'])}")

            # Broadcast player list
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "players_update", "players": state["players"]},
            )

        # NEW: Send current image immediately to this player
        current_image = story_images[state["current_image_index"]]
        await self.send(text_data=json.dumps({
            "type": "new_image",
            "image_index": state["current_image_index"],
            "total_images": len(story_images),
            "image_url": current_image["url"],
            "image_description": current_image["description"],
        }))

        # NEW: Send current game state to joining player
        if state.get("game_started"):
            current_turn_index = state.get("current_turn_index", 0)
            if current_turn_index < len(state["players"]):
                current_player = state["players"][current_turn_index]
                await self.send(text_data=json.dumps({
                    "type": "turn_update",
                    "next_player": current_player,
                    "time_limit": 20,
                }))

        # Start game if first player or all 3 players present
        if not state.get("game_started") and (len(state["players"]) == 1 or len(state["players"]) == 3):
            state["game_started"] = True
            await self.save_state(state)
            await self.start_turn(state)

    async def handle_submit_sentence(self, player, text):
        """Handle player submitting their word/phrase."""
        if not text:
            return

        state = await self.get_state()
        
        if not state or not state.get("players") or len(state["players"]) == 0:
            print(f"⚠️ Invalid state: {state}")
            return

        current_turn_index = state.get("current_turn_index", 0)
        if current_turn_index >= len(state["players"]):
            print(f"⚠️ Invalid turn index {current_turn_index}, resetting to 0")
            current_turn_index = 0
            state["current_turn_index"] = 0
            await self.save_state(state)

        # Verify it's this player's turn
        current_player = state["players"][current_turn_index]
        if player != current_player:
            print(f"⚠️ {player} tried to submit but it's {current_player}'s turn")
            return

        # Add word to current sentence
        state["current_sentence"].append({"player": player, "text": text})
        state["scores"][player] = state["scores"].get(player, 0) + 2
        
        # NEW: Move to next turn immediately
        state["current_turn_index"] = (current_turn_index + 1) % len(state["players"])
        await self.save_state(state)

        print(f"✅ {player} submitted: {text}")

        # NEW: Broadcast story update first
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "story_update",
                "player": player,
                "text": text,
            },
        )

        # Small delay to ensure state sync
        await asyncio.sleep(0.1)

        # Check if round is complete
        if len(state["current_sentence"]) >= len(state["players"]):
            print(f"🔍 All players contributed, evaluating sentence...")
            await self.evaluate_sentence()
        else:
            # NEW: Start next player's turn with fresh timer
            next_player = state["players"][state["current_turn_index"]]
            await self.broadcast_turn_update(next_player, 20)
            # NEW: Start timer for next player
            asyncio.create_task(self.player_timer(next_player, 20, state["current_turn_index"]))

    # -------------------- Turn Management --------------------

    async def start_turn(self, state):
        """Start a player's turn with timer."""
        if not state.get("players") or len(state["players"]) == 0:
            print("⚠️ Cannot start turn: no players")
            return

        current_turn_index = state.get("current_turn_index", 0)
        if current_turn_index >= len(state["players"]):
            current_turn_index = 0
            state["current_turn_index"] = 0
            await self.save_state(state)

        current_player = state["players"][current_turn_index]
        print(f"🎯 Starting turn for: {current_player}")

        await self.broadcast_turn_update(current_player, 20)
        
        # NEW: Start timer with turn index tracking
        asyncio.create_task(self.player_timer(current_player, 20, current_turn_index))

    async def broadcast_turn_update(self, player, time_limit):
        """Broadcast whose turn it is."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "turn_update", "next_player": player, "time_limit": time_limit},
        )

    async def player_timer(self, player, seconds, turn_index):
        """Timeout handler - penalize and skip. NEW: Track turn index."""
        await asyncio.sleep(seconds)
        
        state = await self.get_state()
        
        if not state or not state.get("players") or len(state["players"]) == 0:
            return

        # NEW: Check if turn has already changed
        if state.get("current_turn_index") != turn_index:
            print(f"⏭️ Turn already advanced for {player}, skipping timeout")
            return

        current_turn_index = state.get("current_turn_index", 0)
        if current_turn_index >= len(state["players"]):
            return

        current_player = state["players"][current_turn_index]
        if current_player != player:
            return

        # Penalize
        state["scores"][player] = state["scores"].get(player, 0) - 2
        
        # Add missed turn marker
        state["current_sentence"].append({"player": player, "text": "[missed turn]"})
        
        # NEW: Move to next turn
        state["current_turn_index"] = (current_turn_index + 1) % len(state["players"])
        await self.save_state(state)

        print(f"⏰ {player} timed out!")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "timeout_event",
                "player": player,
                "penalty": 2,
            },
        )

        # Check if sentence is complete
        if len(state["current_sentence"]) >= len(state["players"]):
            await self.evaluate_sentence()
        else:
            # NEW: Start next player's turn
            next_player = state["players"][state["current_turn_index"]]
            await self.broadcast_turn_update(next_player, 20)
            asyncio.create_task(self.player_timer(next_player, 20, state["current_turn_index"]))

    # -------------------- Sentence Evaluation --------------------

    async def evaluate_with_ai(self, sentence, image_description):
        """Evaluates the sentence using OpenAI."""
        prompt = f"""
You are a Filipino language evaluator.
Evaluate the following Filipino sentence based on:
1. Grammar correctness
2. Coherence and flow
3. Creativity
4. Relevance to the image description

Image description:
"{image_description}"

Sentence:
"{sentence}"

Give a total score from 1 to 20 (just the number, no explanation).
"""

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
            )

            text = response.choices[0].message.content.strip()
            score = int("".join(filter(str.isdigit, text)))
            return max(1, min(score, 20))
        except Exception as e:
            print(f"⚠️ AI evaluation error: {e}")
            return 10

    async def evaluate_sentence(self):
        """Evaluate the completed sentence."""
        state = await self.get_state()
        
        if not state:
            print("⚠️ Cannot evaluate: no state")
            return
        
        # Combine all words into full sentence
        full_sentence = " ".join([
            part["text"] for part in state.get("current_sentence", [])
            if part["text"] != "[missed turn]"
        ])

        print(f"📝 Evaluating sentence: {full_sentence}")

        # Get current image metadata
        current_index = state.get("current_image_index", 0)
        
        if current_index >= len(story_images):
            print(f"⚠️ Invalid image index: {current_index}")
            current_index = 0
            state["current_image_index"] = 0
        
        image_data = story_images[current_index]
        image_description = image_data["description"]

        # AI evaluation
        group_score = await self.evaluate_with_ai(full_sentence, image_description)

        # Distribute score to players who participated
        num_participants = sum(1 for part in state.get("current_sentence", []) 
                              if part["text"] != "[missed turn]")
        
        if num_participants > 0:
            points_per_player = group_score // num_participants
            for part in state.get("current_sentence", []):
                if part["text"] != "[missed turn]":
                    player_name = part["player"]
                    state["scores"][player_name] = state["scores"].get(player_name, 0) + points_per_player

        # Broadcast evaluation
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "sentence_evaluation",
                "sentence": full_sentence,
                "score": group_score,
            },
        )

        # Reset for next image
        state["current_image_index"] += 1
        state["current_sentence"] = []
        state["current_turn_index"] = 0
        await self.save_state(state)

        # Check if game is complete
        if state["current_image_index"] >= state["total_images"]:
            print(f"🏁 Game complete!")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_complete",
                    "scores": state["scores"],
                },
            )
        else:
            # Send next image
            next_image = story_images[state["current_image_index"]]
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "new_image",
                    "image_index": state["current_image_index"],
                    "total_images": len(story_images),
                    "image_url": next_image["url"],
                    "image_description": next_image["description"],
                },
            )
            
            # Small delay before starting next turn
            await asyncio.sleep(0.5)
            await self.start_turn(state)

    # -------------------- WebSocket Broadcasts --------------------

    async def players_update(self, event):
        await self.send(json.dumps(event))

    async def story_update(self, event):
        await self.send(json.dumps(event))

    async def turn_update(self, event):
        await self.send(json.dumps(event))

    async def timeout_event(self, event):
        await self.send(json.dumps(event))

    async def sentence_evaluation(self, event):
        await self.send(json.dumps(event))

    async def new_image(self, event):
        await self.send(json.dumps(event))

    async def game_complete(self, event):
        await self.send(json.dumps(event))