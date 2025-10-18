# import json
# import asyncio
# from redis import asyncio as aioredis
# from channels.generic.websocket import AsyncWebsocketConsumer
# from django.conf import settings
# from openai import OpenAI

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# async def get_redis():
#     """Singleton Redis connection."""
#     return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


# class StoryChainConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope["url_route"]["kwargs"]["room_name"].replace(" ", "_")
#         self.room_group_name = f"story_{self.room_name}"

#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#         self.redis = await get_redis()
#         state = await self.get_state()

#         # Initialize new room state if it doesn't exist
#         if not state:
#             state = {
#                 "current_turn": 0,
#                 "players": [],
#                 "scores": {},
#                 "current_image_index": 0,
#                 "total_images": 5,
#                 "sentence": [],
#                 "turn_timer_active": False,
#             }
#             await self.save_state(state)
            
#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     # -------------------- State Helpers --------------------

#     async def get_state(self):
#         data = await self.redis.get(self.room_group_name)
#         return json.loads(data) if data else None

#     async def save_state(self, state):
#         await self.redis.set(self.room_group_name, json.dumps(state))

#     # -------------------- Message Handling Code --------------------

#     # -------------------- Turn Management Code --------------------

#     # -------------------- Sentence Evaluation --------------------

#     async def word_submitted(self, event):
#         await self.send(text_data=json.dumps({
#             "type": "word_submitted",
#             "player": event["player"],
#             "word": event["word"],
#         }))
    
#     async def evaluate_with_ai(sentence):
#         prompt = f"Rate this Filipino sentence for coherence, grammar, and creativity from 1 to 10:\n\n{sentence}"
#         response = await client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt}]
#         )
#         text = response.choices[0].message.content.strip()
#         try:
#             return int(text)
#         except:
#             return 7

#     async def evaluate_sentence(self):
#         state = await self.get_state()
#         full_sentence = " ".join(state["sentence"])

#         # Placeholder AI evaluation
#         ai_score = 10  # Replace with actual evaluation logic later

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type": "sentence_evaluation",
#                 "sentence": full_sentence,
#                 "score": ai_score,
#             },
#         )

#         # Progress to next image
#         state["current_image_index"] += 1
#         state["sentence"] = []
#         await self.save_state(state)

#         # Send next image or finish
#         if state["current_image_index"] >= state["total_images"]:
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     "type": "game_complete",
#                     "scores": state["scores"],
#                     "total_score": sum(state["scores"].values()),
#                 },
#             )
#         else:
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     "type": "new_image",
#                     "image_index": state["current_image_index"],
#                     "total_images": state["total_images"],
#                 },
#             )
#             await self.start_turn(state)

#     # -------------------- WebSocket Broadcasts --------------------

#     async def players_update(self, event):
#         await self.send(json.dumps(event))

#     async def story_update(self, event):
#         await self.send(json.dumps(event))

#     async def turn_update(self, event):
#         await self.send(json.dumps(event))

#     async def timeout_event(self, event):
#         await self.send(json.dumps(event))

#     async def sentence_evaluation(self, event):
#         await self.send(json.dumps(event))

#     async def new_image(self, event):
#         await self.send(json.dumps(event))

#     async def game_complete(self, event):
#         await self.send(json.dumps(event))
