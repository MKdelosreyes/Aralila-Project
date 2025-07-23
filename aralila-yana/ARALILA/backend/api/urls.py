from django.urls import path
from . import views
from .views import UserProfileView

urlpatterns = [
    path('ping/', views.ping),  # http://127.0.0.1:8000/api/ping/
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]