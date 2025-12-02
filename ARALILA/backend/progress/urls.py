from django.urls import path
from . import views

urlpatterns = [
    path("leaderboard/", views.leaderboard_view, name="progress-leaderboard"),
]

