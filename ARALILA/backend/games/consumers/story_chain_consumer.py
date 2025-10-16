import json
import asyncio
from redis import asyncio as aioredis
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
import os
from dotenv import load_dotenv
from openai import OpenAI
from games.data.story_images import story_images # Ensure this import is correct based on your project structure

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_redis():
    """Singleton Redis connection."""
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


class StoryChainConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"].replace(" ", "_")
        self.room_group_name = f"story_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        self.redis = await get_redis()
        state = await self.get_state()

        # Initialize new room state if it doesn't exist
        if not state:
            state = {
                "current_turn": 0,
                "players": [],
                "scores": {},
                "current_image_index": 0,
                "total_images": 5,
                "sentence": [],
                "turn_timer_active": False,
            }
            await self.save_state(state)

        # Notify other players
        # await self.channel_layer.group_send(
        #     self.room_group_name,
        #     {
        #         "type": "player_joined",
        #         "player": self.channel_name,
        #     },
        # )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # -------------------- State Helpers --------------------

    async def get_state(self):
        data = await self.redis.get(self.room_group_name)
        return json.loads(data) if data else None

    async def save_state(self, state):
        await self.redis.set(self.room_group_name, json.dumps(state))

    # -------------------- Message Handling --------------------

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")
        player = data.get("player")
        state = await self.get_state() or {}

        if msg_type == "player_join":
            if player not in state.get("players", []):
                state["players"].append(player)
                state["scores"][player] = 0
                await self.save_state(state)

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "players_update", "players": state["players"]},
                )

                # If this is the first player, start the first turn
                if len(state["players"]) == 1:
                    # First player — initialize game
                    await self.start_turn(state)

                    # 🖼️ Send the first image
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "new_image",
                            "image_index": 0,
                            "total_images": len(story_images),
                            "image_url": story_images[0]["url"],
                            "image_description": story_images[0]["description"],
                        },
                    )

                elif len(state["players"]) == 3:
                    # Optional: Automatically start game once 3 players have joined
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {"type": "game_start"}
    )

        elif msg_type == "submit_sentence":
            text = data.get("text", "").strip()
            if not text:
                return

            state["sentence"].append(text)
            state["scores"][player] = state["scores"].get(player, 0) + 2
            await self.save_state(state)

            # Broadcast update
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "story_update",
                    "player": player,
                    "text": text,
                },
            )

            # Check if round is complete
            if len(state["sentence"]) >= len(state["players"]):
                await self.evaluate_sentence()
            else:
                await self.next_turn()


    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            "type": "player_joined",
            "player": event["player"]
        }))


    async def game_start(self, event):
        await self.send(json.dumps({
            "type": "game_start"
        }))

    # -------------------- Turn Management --------------------

    async def start_turn(self, state):
        """Start first player's turn."""
        current_player = state["players"][state["current_turn"]]
        await self.broadcast_turn_update(current_player)
        asyncio.create_task(self.player_timer(current_player, 15))

    async def next_turn(self):
        state = await self.get_state()
        state["current_turn"] = (state["current_turn"] + 1) % len(state["players"])
        await self.save_state(state)

        next_player = state["players"][state["current_turn"]]
        await self.broadcast_turn_update(next_player)
        asyncio.create_task(self.player_timer(next_player, 15))

    async def broadcast_turn_update(self, player):
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "turn_update", "next_player": player, "time_limit": 15},
        )

    async def player_timer(self, player, seconds):
        """Auto-skip or penalize after time limit."""
        await asyncio.sleep(seconds)
        state = await self.get_state()
        if not state or not state["players"]:
            return

        if state["players"][state["current_turn"]] == player:
            state["scores"][player] -= 2
            await self.save_state(state)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "timeout_event",
                    "player": player,
                    "penalty": 2,
                },
            )
            await self.next_turn()

    # -------------------- Sentence Evaluation --------------------

    async def word_submitted(self, event):
        await self.send(text_data=json.dumps({
            "type": "word_submitted",
            "player": event["player"],
            "word": event["word"],
        }))
    
    async def evaluate_with_ai(self, sentence, image_description):
        """
        Evaluates the players' sentence based on grammar, coherence, creativity,
        and relevance to the given image.
        """

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
            score = int("".join(filter(str.isdigit, text)))  # Extract numeric score safely
            return max(1, min(score, 20))  # Clamp to 1–20 range
        except Exception as e:
            print("⚠️ AI evaluation error:", e)
            return 10  # default fallback score

    async def evaluate_sentence(self):
        state = await self.get_state()
        full_sentence = " ".join(state["sentence"])

        # Get the current image metadata
        current_index = state.get("current_image_index", 0)
        image_data = story_images[current_index]
        image_description = image_data["description"]

        group_score = await self.evaluate_with_ai(full_sentence, image_description)  # Replace with actual evaluation logic later

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "sentence_evaluation",
                "sentence": full_sentence,
                "score": group_score,
            },
        )

        # Progress to next image
        state["current_image_index"] += 1
        state["sentence"] = []
        await self.save_state(state)

        # Send next image or finish
        if state["current_image_index"] >= state["total_images"]:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_complete",
                    "scores": state["scores"],
                    "total_score": sum(state["scores"].values()),
                },
            )
        else:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "new_image",
                    "image_index": state["current_image_index"],
                    "total_images": len(story_images),
                    "image_url": story_images[state["current_image_index"]]["url"],
                    "image_description": story_images[state["current_image_index"]]["description"],
                },
            )
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

# print("Hello World")