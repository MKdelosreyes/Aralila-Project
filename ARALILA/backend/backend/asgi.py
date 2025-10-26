import os
import django
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator, OriginValidator
from django.core.asgi import get_asgi_application
# from urllib.parse import urlparse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django_asgi_app = get_asgi_application()
from games import routing

# ALLOWED_WS_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "https://aralila-project.vercel.app",
#     "https://aralila.vercel.app",
#     "https://*.vercel.app",  # Allow all Vercel preview deployments
# ]

# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket": OriginValidator(
#         AuthMiddlewareStack(
#             URLRouter(
#                 routing.websocket_urlpatterns
#             )
#         ),
#         ALLOWED_WS_ORIGINS
#     ),
# })

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})

# print("✅ ASGI application configured with WebSocket support")
# print(f"🌐 Allowed WebSocket origins: {ALLOWED_WS_ORIGINS}")
# print(f"📋 WebSocket routes: {routing.websocket_urlpatterns}")