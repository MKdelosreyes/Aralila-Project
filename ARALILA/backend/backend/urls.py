from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
# from users.views import CreateUserView 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'aralila-backend',
        'websocket': 'enabled'
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api/users/register/', CreateUserView.as_view(), name='user-register'),
    path('api/users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/auth', include('rest_framework.urls')),
    path('api/games/', include("games.urls")),
    path('api/users/', include('users.urls')),
    path('api/progress/', include('progress.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)