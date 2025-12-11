from django.urls import path
from . import views

urlpatterns = [
    # Using path param (if needed)
    path("leaderboard/", views.leaderboard_view, name="progress-leaderboard"),
]
