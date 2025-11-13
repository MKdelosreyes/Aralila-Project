from django.db import models
from django.utils import timezone
from django.conf import settings
from games.models import Game, Area


class GameProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    area = models.ForeignKey(Area, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    
    # Star progression tracking
    stars_earned = models.IntegerField(default=0)  # 0, 1, 2, or 3
    
    # Individual difficulty scores
    difficulty_1_score = models.IntegerField(default=0)  # Easy level
    difficulty_1_completed = models.BooleanField(default=False)
    
    difficulty_2_score = models.IntegerField(default=0)  # Medium level
    difficulty_2_completed = models.BooleanField(default=False)
    difficulty_2_unlocked = models.BooleanField(default=False)  # NEW: Track if unlocked
    
    difficulty_3_score = models.IntegerField(default=0)  # Hard level
    difficulty_3_completed = models.BooleanField(default=False)
    difficulty_3_unlocked = models.BooleanField(default=False)  # NEW: Track if unlocked
    
    # Legacy fields
    score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    
    attempts = models.IntegerField(default=0)
    last_played = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'area', 'game']
        ordering = ['-last_played']

    def __str__(self):
        return f"{self.user.first_name} - {self.game.name} - {self.stars_earned}★"
    
    def update_stars(self):
        """Calculate stars based on difficulty completions (sequential logic)."""
        stars = 0
        if self.difficulty_1_completed:
            stars = 1
            self.difficulty_2_unlocked = True
        if self.difficulty_2_completed:
            stars = 2
            self.difficulty_3_unlocked = True
        if self.difficulty_3_completed:
            stars = 3
        self.stars_earned = stars
        self.save()
    
    def can_access_difficulty(self, difficulty):
        """Sequential unlock: 1 always; 2 only after 1 completed; 3 only after 2 completed (or full mastery)."""
        if difficulty == 1:
            return True
        if difficulty == 2:
            return self.difficulty_1_completed
        if difficulty == 3:
            return self.difficulty_2_completed
        return False


# Optional: Gamification badges/achievements
class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=255, blank=True)  # e.g., path to image or emoji

    def __str__(self):
        return f"{self.name}"


class UserBadge(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="badges"
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "badge")

    def __str__(self):
        return f"{self.user.email} - {self.badge.name}"


class MultiplayerStats(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="multiplayer_stats")
    total_rooms_played = models.PositiveIntegerField(default=0)
    total_rounds_played = models.PositiveIntegerField(default=0)
    average_sentence_score = models.FloatField(default=0.0)
    total_score = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} Multiplayer Stats"
