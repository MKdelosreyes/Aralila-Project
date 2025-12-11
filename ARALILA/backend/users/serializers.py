from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = CustomUser
        fields = [
            'supabase_user_id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'school_name',
            'profile_pic',
            'ls_points',           
            'collected_badges',    
            'is_active',
            'date_joined',
        ]
        read_only_fields = [
            'supabase_user_id',
            'email',
            'ls_points',           
            'collected_badges',     
            'is_active',
            'date_joined',
        ]
