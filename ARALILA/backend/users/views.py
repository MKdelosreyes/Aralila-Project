from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import traceback

# Create your views here.
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
    """
    Update user profile.
    Only updates Django-specific fields (school_name, profile_pic).
    Name/email updates should be done via Supabase SDK in frontend.
    """
    user = request.user
    
    # Only allow updating these fields
    allowed_fields = ['school_name', 'profile_pic']
    
    for field in allowed_fields:
        if field in request.data:
            setattr(user, field, request.data[field])
    
    user.save()
    
    serializer = CustomUserSerializer(user)
    return Response(serializer.data)