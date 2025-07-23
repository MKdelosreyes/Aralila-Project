from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from .serializers import CustomUserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    User = get_user_model()
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({"message": "pong!"})

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role,
        }
        return Response(data)