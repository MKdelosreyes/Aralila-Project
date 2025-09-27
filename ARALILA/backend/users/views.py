from django.shortcuts import render
from django.contrib.auth import get_user_model
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    # User = get_user_model()
    # queryset = User.objects.all()
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]  # Allow anyone to create an account