import json
from channels.generic.websocket import AsyncWebsocketConsumer

rooms = {}

class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f"lobby_{self.room_code}"
        self.player_name = self.scope["query_string"].decode().split("=")[-1]

        # ✅ Ensure the room exists
        if self.room_code not in rooms:
            rooms[self.room_code] = []

        # Add player to room if not already there
        if self.player_name not in rooms[self.room_code]:
            rooms[self.room_code].append(self.player_name)

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # ✅ Send the current player list ONLY to this player
        await self.send(text_data=json.dumps({
            "type": "player_list",
            "players": rooms[self.room_code],
        }))

        # Notify everyone that someone joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_joined",
                "player": self.player_name,
                "players": rooms[self.room_code],
            }
        )

        # ✅ If room has reached 3 players, start the game
        if len(rooms[self.room_code]) == 3:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_start",
                    "turn_order": rooms[self.room_code],
                }
            )

    async def disconnect(self, close_code):
        if self.room_code in rooms and self.player_name in rooms[self.room_code]:
            rooms[self.room_code].remove(self.player_name)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_left",
                "player": self.player_name,
                "players": rooms[self.room_code],
            }
        )
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            "type": "player_joined",
            "player": event["player"],
            "players": event["players"],
        }))

    async def player_left(self, event):
        await self.send(text_data=json.dumps({
            "type": "player_left",
            "player": event["player"],
            "players": event["players"],
        }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            "type": "game_start",
            "turn_order": event["turn_order"],
        }))

    async def receive(self, text_data):
        pass
