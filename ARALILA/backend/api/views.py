from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from .serializers import CustomUserSerializer, ClassroomSerializer, StudentSerializer
from .models import CustomUser, ClassRoom, Student
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({"message": "pong!"})


class CreateUserView(generics.CreateAPIView):
    User = get_user_model()
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
class CreateClassroomView(generics.CreateAPIView):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    
class ClassRoomView(generics.RetrieveAPIView):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class ClassRoomListView(generics.ListAPIView):
    # queryset = ClassRoom.objects.filter(teacher=request.user)
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClassRoom.objects.filter(teacher=self.request.user)
    
class ClassroomStudentListView(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        classroom_id = self.kwargs['pk']
        return Student.objects.filter(classroom_id=classroom_id)
