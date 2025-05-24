from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CustomUser, ClassRoom, Student

class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()  # Since it's a @property and not a model field

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'school_name', 'password', 'role', 'full_name', 'profile_pic'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'school_name': {'required': False},
            'profile_pic': {'required': False},
            'role': {'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
class StudentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'classroom'
        ]
    
class ClassroomSerializer(serializers.ModelSerializer):
    students = StudentSerializer(many=True, read_only=True)

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'class_name', 'teacher', 'section', 'subject',
            'semester', 'class_key', 'created_at', 'isActive', 'students'
        ]

        extra_kwargs = {
            'teacher': {'required': True},
            'created_at': {'read_only': True},
        }

