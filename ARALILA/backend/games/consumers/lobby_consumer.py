import json
from channels.generic.websocket import AsyncWebsocketConsumer
from redis import asyncio as aioredis
from django.conf import settings

async def get_redis():
    """Singleton Redis connection."""
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)

class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f"lobby_{self.room_code}"
        self.player_name = self.scope["query_string"].decode().split("=")[-1]
        
        print(f"🔌 Player '{self.player_name}' connecting to room '{self.room_code}'")
        
        # Use Redis
        self.redis = await get_redis()
        await self.redis.ping()
        
        # Get existing players from Redis
        players_json = await self.redis.get(f"room:{self.room_code}:players")
        players = json.loads(players_json) if players_json else []

        # NEW: Check if player already exists (prevent duplicates)
        if self.player_name in players:
            print(f"⚠️ Player '{self.player_name}' already in room, not adding again")
        else:
            players.append(self.player_name)
            await self.redis.set(
                f"room:{self.room_code}:players", 
                json.dumps(players),
                ex=3600  # Expire in 1 hour
            )
            print(f"✅ Player '{self.player_name}' added. Total: {len(players)}")

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Send current player list to ONLY this player
        await self.send(text_data=json.dumps({
            "type": "player_list",
            "players": players,
        }))
        print(f"📤 Sent player_list to '{self.player_name}': {players}")

        # Notify everyone (including this player) that someone joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_joined",
                "player": self.player_name,
                "players": players,
            }
        )

        # Auto-start game if 3 players
        if len(players) == 3:
            import random
            turn_order = players.copy()
            random.shuffle(turn_order)
            
            print(f"🚀 Auto-starting game with turn order: {turn_order}")
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_start",
                    "turn_order": turn_order,
                }
            )

    async def disconnect(self, close_code):
        print(f"🔌 Player '{self.player_name}' disconnecting from room '{self.room_code}'")
        
        # Get current players from Redis
        players_json = await self.redis.get(f"room:{self.room_code}:players")
        players = json.loads(players_json) if players_json else []
        
        if self.player_name in players:
            players.remove(self.player_name)
            await self.redis.set(
                f"room:{self.room_code}:players", 
                json.dumps(players),
                ex=3600
            )
            print(f"✅ Player '{self.player_name}' removed. Remaining: {len(players)}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_left",
                "player": self.player_name,
                "players": players,
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
        # No-op for now
        pass