from django.contrib import admin
from django.urls import path, include
from users.views import CreateUserView 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/register/', CreateUserView.as_view(), name='user-register'),
    path('users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/auth', include('rest_framework.urls')), 
    path('games/', include("games.urls")),
] 
