from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'full_name', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'full_name': {'required': False, 'allow_blank': True},
            'role': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        email = validated_data.get("email")
        password = validated_data.get("password")
        full_name = validated_data.get("full_name", "")
        role = validated_data.get("role", "")

        username = email.split("@")[0] # Just to be sure

        user = CustomUser.objects.create_user(
            email=email,
            username=username,
            password=password,
            full_name=full_name,
            role=role
        )
        return user