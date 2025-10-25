from django.urls import path
from .views import (
    CreateUserView, 
    login_view, 
    profile_view, 
    update_profile_view
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('profile/', profile_view, name='profile'),
    path('profile/update/', update_profile_view, name='update-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]