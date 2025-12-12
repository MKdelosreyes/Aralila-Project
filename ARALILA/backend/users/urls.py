from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update-profile'),
    
    # Heart endpoints
    path('hearts/status/', views.hearts_status_view, name='hearts-status'),
    path('hearts/reduce/', views.reduce_heart_view, name='reduce-heart'),
    
    # Badge endpoints
    path('badges/', views.user_badges_view, name='user-badges'),
    path('badges/<str:badge_id>/claim/', views.claim_badge_view, name='claim-badge'),
]