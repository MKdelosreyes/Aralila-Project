from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()  # Since it's a @property and not a model field
    # date_joined = serializers.DateField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'school_name', 'password', 'full_name', 'profile_pic', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'school_name': {'required': False},
            'profile_pic': {'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def get_date_joined(self, obj):
        return obj.date_joined.date()