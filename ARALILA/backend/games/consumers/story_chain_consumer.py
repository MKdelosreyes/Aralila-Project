import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging

logger = logging.getLogger(__name__)

class StoryChainConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
            safe_room_name = self.room_name.replace(" ", "_").replace(".", "_")
            self.room_group_name = f"story_{safe_room_name}"
            logger.info(f"Connecting to room: {self.room_group_name}")

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            logger.info("WebSocket accepted.")
        except Exception as e:
            logger.error(f"Error during connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "submit_sentence":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "story_update",  
                    "player": data["player"],
                    "text": data["text"],
                },
            )

    async def story_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "story_update",
            "player": event["player"],
            "text": event["text"]
        }))
