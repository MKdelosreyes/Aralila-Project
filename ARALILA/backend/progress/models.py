from django.db import models
from django.utils import timezone
from django.conf import settings


# Game Progress Tracking
class GameProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="progress"
    )
    game = models.ForeignKey(
        "games.Game", 
        on_delete=models.CASCADE, 
        related_name="progress"
    )
    area = models.ForeignKey(
        "games.Area", 
        on_delete=models.CASCADE, 
        related_name="progress"
    )
    score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    last_played = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "game", "area")

    def __str__(self):
        return f"{self.user.email} - {self.game.name} ({self.area.name})"


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
