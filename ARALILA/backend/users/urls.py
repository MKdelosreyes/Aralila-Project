from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update-profile'),

    # -----------------------------
    # Badges Endpoints
    # -----------------------------
    path('me/badges/', views.user_badges_view, name='user-badges'),
    path('me/badges/<str:badge_id>/claim/', views.claim_badge_view, name='claim-badge'),
]
