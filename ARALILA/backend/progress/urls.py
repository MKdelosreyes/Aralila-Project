from django.urls import path
from . import views

urlpatterns = [
    path("leaderboard/", views.leaderboard_view, name="progress-leaderboard"),
    path('analytics/dashboard/', views.get_analytics_dashboard, name='analytics-dashboard'),
    path('analytics/skill-mastery/', views.get_skill_mastery, name='skill-mastery'),
    path('analytics/improvement-trends/', views.get_improvement_trends, name='improvement-trends'),
    path('analytics/insights/', views.get_personalized_insights, name='personalized-insights'),
    path('analytics/time/', views.get_time_analytics, name='time-analytics'),
]
