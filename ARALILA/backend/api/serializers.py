from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CustomUser, ClassRoom, Student, Game, StudentGameProgress, Activity, PendingRequest, StudentClassroomStats

class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()  # Since it's a @property and not a model field
    # date_joined = serializers.DateField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'school_name', 'password', 'role', 'full_name', 'profile_pic', 'date_joined'
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
    
    def get_date_joined(self, obj):
        return obj.date_joined.date()
    
class StudentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'classroom'
        ]
    
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title', 'topic', 'description']

class GameProgressSerializer(serializers.ModelSerializer):
    game = GameSerializer()
    student = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = StudentGameProgress
        fields = ['id', 'student', 'game', 'score', 'completed', 'rank', 'updated_at']

class TeacherActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'classroom', 'title', 'description',
            'rubric', 'type', 'created_at'
        ]


class ClassroomSerializer(serializers.ModelSerializer):
    students = StudentSerializer(many=True, read_only=True)
    activities = TeacherActivitySerializer(many=True, read_only=True)
    # games = GameSerializer(many=True, read_only=True)
    total_class_score = serializers.SerializerMethodField()
    total_tasks = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'class_name', 'teacher', 'section', 
            'class_key', 'created_at', 'isActive',
            'students', 'activities',
            'total_class_score', 'total_tasks',
        ]
        extra_kwargs = {
            'teacher': {'required': True},
            'created_at': {'read_only': True},
        }

    def get_total_class_score(self, obj):
        return obj.total_class_score

    def get_total_tasks(self, obj):
        return obj.total_tasks


class PendingRequestSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    classroom = ClassroomSerializer()

    class Meta:
        model = PendingRequest
        fields = ['id', 'student', 'classroom', 'status', 'requested_at']

class StudentClassroomStatsSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.class_name', read_only=True)

    class Meta:
        model = StudentClassroomStats
        fields = [
            'id',
            'student',
            'student_name',
            'classroom',
            'classroom_name',
            'total_score',
            'rank',
            'progress',
        ]
