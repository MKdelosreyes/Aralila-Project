from django.urls import re_path
from .consumers.story_chain_consumer import StoryChainConsumer
from .consumers.lobby_consumer import LobbyConsumer

websocket_urlpatterns = [
    re_path(r"^ws/story/(?P<room_name>[^/]+)/$", StoryChainConsumer.as_asgi()),
    re_path(r"^ws/lobby/(?P<room_code>\w+)/$", LobbyConsumer.as_asgi()),
]
