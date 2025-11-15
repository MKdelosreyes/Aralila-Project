from django.urls import path
from . import views
from .views import (
    CreateUserView, 
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # path('register/', CreateUserView.as_view(), name='register'), 
    path('register/', views.register, name='register'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('resend-verification/', views.resend_verification, name='resend-verification'),
    path('login/', views.login_view, name='login'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]