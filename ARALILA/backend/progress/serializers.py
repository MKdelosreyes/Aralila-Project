from rest_framework import serializers
from .models import GameProgress
from django.contrib.auth import get_user_model

User = get_user_model()


class LeaderboardEntrySerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    name = serializers.CharField()
    profile_pic = serializers.CharField(allow_blank=True, allow_null=True)
    score = serializers.IntegerField()
    stars_earned = serializers.IntegerField()
    difficulty = serializers.IntegerField()
    time_taken = serializers.FloatField()

    class Meta:
        fields = ["user_id", "name", "profile_pic", "score", "stars_earned", "difficulty", "time_taken"]


def progress_to_entry(progress: GameProgress, difficulty: int) -> dict:
    user = progress.user
    # Prefer user's first+last name, fallback to email/username
    name = getattr(user, "full_name", None) or f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
    if not name:
        name = getattr(user, "email", None) or getattr(user, "username", "")

    profile_pic = getattr(user, "profile_pic", None) or ""

    score_field = f"difficulty_{difficulty}_score"
    time_field = f"difficulty_{difficulty}_time_taken"
    score = getattr(progress, score_field, 0)
    time_taken = getattr(progress, time_field, 0.0)

    return {
        "user_id": user.id,
        "name": name,
        "profile_pic": profile_pic,
        "score": score,
        "stars_earned": progress.stars_earned,
        "difficulty": difficulty,
        "time_taken": time_taken,
    }
