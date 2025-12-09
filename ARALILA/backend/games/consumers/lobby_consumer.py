import json
from channels.generic.websocket import AsyncWebsocketConsumer
from redis import asyncio as aioredis
from django.conf import settings
from urllib.parse import parse_qs, unquote  # NEW: Proper URL parsing

async def get_redis():
    """Singleton Redis connection."""
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)

class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f"lobby_{self.room_code}"
        
        # NEW: Properly parse query string
        query_string = self.scope["query_string"].decode()
        params = parse_qs(query_string)
        
        # Extract parameters (parse_qs returns lists, so get first item)
        self.player_name = unquote(params.get("player", ["Guest"])[0])
        max_players_param = params.get("maxPlayers", ["3"])[0]
        
        print(f"🔌 Player '{self.player_name}' connecting to room '{self.room_code}'")
        
        # Use Redis
        self.redis = await get_redis()
        await self.redis.ping()
        
        # NEW: Check if room already has max_players set
        existing_max = await self.redis.get(f"room:{self.room_code}:max_players")
        
        if not existing_max:
            # First player (host) sets the max_players
            await self.redis.set(
                f"room:{self.room_code}:max_players",
                max_players_param,
                ex=3600
            )
            print(f"✅ Room '{self.room_code}' created with {max_players_param} players")
            max_players = int(max_players_param)
        else:
            # Joiners use the existing max_players from Redis
            max_players = int(existing_max)
            print(f"✅ Room '{self.room_code}' already set to {max_players} players (existing)")
         
        # Get existing players from Redis
        players_json = await self.redis.get(f"room:{self.room_code}:players")
        players = json.loads(players_json) if players_json else []

        # Check if player already exists (prevent duplicates)
        if self.player_name in players:
            print(f"⚠️ Player '{self.player_name}' already in room, not adding again")
        else:
            players.append(self.player_name)
            await self.redis.set(
                f"room:{self.room_code}:players", 
                json.dumps(players),
                ex=3600
            )
            print(f"✅ Player '{self.player_name}' added. Total: {len(players)}/{max_players}")

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Send current player list and max_players to ONLY this player
        await self.send(text_data=json.dumps({
            "type": "player_list",
            "players": players,
            "max_players": max_players,
        }))
        print(f"📤 Sent player_list to '{self.player_name}': {players} (max: {max_players})")

        # Notify everyone (including this player) that someone joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_joined",
                "player": self.player_name,
                "players": players,
                "max_players": max_players,
            }
        )

        # Auto-start game when max_players reached
        if len(players) == max_players:
            import random
            turn_order = players.copy()
            random.shuffle(turn_order)
            
            print(f"🚀 Auto-starting game with {max_players} players. Turn order: {turn_order}")
            
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

        # Get max_players
        max_players_str = await self.redis.get(f"room:{self.room_code}:max_players")
        max_players = int(max_players_str) if max_players_str else 3

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_left",
                "player": self.player_name,
                "players": players,
                "max_players": max_players,
            }
        )
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            "type": "player_joined",
            "player": event["player"],
            "players": event["players"],
            "max_players": event.get("max_players", 3),
        }))

    async def player_left(self, event):
        await self.send(text_data=json.dumps({
            "type": "player_left",
            "player": event["player"],
            "players": event["players"],
            "max_players": event.get("max_players", 3),
        }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            "type": "game_start",
            "turn_order": event["turn_order"],
        }))

    async def receive(self, text_data):
        # No-op for now
        pass