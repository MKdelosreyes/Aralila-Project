from django.urls import path
from . import views

urlpatterns = [
    # Using path param (if needed)
    path("leaderboard/<str:game_type>/", views.leaderboard_view, name="progress-leaderboard"),
]

