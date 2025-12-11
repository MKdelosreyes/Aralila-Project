from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CustomUser
from .serializers import CustomUserSerializer

# -----------------------------
# Existing profile endpoints
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    user = request.user  
    serializer = CustomUserSerializer(user)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update user profile (school_name, profile_pic)"""
    user = request.user
    allowed_fields = ['school_name', 'profile_pic']
    for field in allowed_fields:
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()
    serializer = CustomUserSerializer(user)
    return Response(serializer.data)

# -----------------------------
# Badges endpoints
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_badges_view(request):
    """Return all badges for the current user"""
    user: CustomUser = request.user
    badges = user.collected_badges or []
    return Response({"badges": badges})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_badge_view(request, badge_id: str):
    """Mark a badge as claimed"""
    user: CustomUser = request.user
    updated = False

    if not user.collected_badges:
        return Response({"success": False, "message": "No badges found"}, status=400)

    for badge in user.collected_badges:
        if badge.get("id") == badge_id and badge.get("status") != "claimed":
            badge["status"] = "claimed"
            updated = True
            break

    if updated:
        user.save()
        return Response({"success": True, "badge_id": badge_id})
    else:
        return Response({"success": False, "message": "Badge not found or already claimed"}, status=400)