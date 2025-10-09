from django.urls import re_path
from .consumers.story_chain_consumer import StoryChainConsumer

websocket_urlpatterns = [
    re_path(r"^ws/story/(?P<room_name>[^/]+)/$", StoryChainConsumer.as_asgi()),
]
