from django.db import models
import random
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin 
from django.utils import timezone 

class ProfilePicEnum(models.TextChoices):
    AVATAR1 = '/images/bear.png', 'Avatar 1'
    AVATAR2 = '/images/cat.png', 'Avatar 2'
    AVATAR3 = '/images/chicken.png', 'Avatar 3'
    AVATAR4 = '/images/owl.png', 'Avatar 4'
    AVATAR5 = '/images/panda.png', 'Avatar 5'
    DEFAULT = '/images/meerkat.png', 'Default'

class CustomUser(AbstractBaseUser, PermissionsMixin):
    supabase_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    school_name = models.CharField(max_length=255, blank=True, null=True)
    profile_pic = models.CharField(max_length=255, choices=ProfilePicEnum.choices, blank=True)
    
    ls_points = models.IntegerField(default=0)  
    collected_badges = models.JSONField(default=list, blank=True, help_text="List of collected badge identifiers")

    current_hearts = models.IntegerField(default=3)
    next_refill_at = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login_date = models.DateField(null=True, blank=True)
    login_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='customuser_set',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_set',
        related_query_name='customuser',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  
    
    class Meta:
        pass

    def __str__(self):
        return f"{self.email}"

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()
    
    def save(self, *args, **kwargs):
        if not self.profile_pic:
            self.profile_pic = random.choice(list(ProfilePicEnum.values))
        super().save(*args, **kwargs)

    def refill_hearts_if_needed(self):
        """Incrementally refill hearts every 5 minutes"""
        from datetime import timedelta
        
        if self.current_hearts >= 3:
            self.next_refill_at = None
            return
        
        if self.next_refill_at and timezone.now() >= self.next_refill_at:
            self.current_hearts = min(self.current_hearts + 1, 3)
            
            if self.current_hearts < 3:
                self.next_refill_at = timezone.now() + timedelta(minutes=5)
            else:
                self.next_refill_at = None
            
            self.save()
    
    def update_streak(self):
        from datetime import date, timedelta
        today = date.today()
        
        if self.last_active_date == today:
            return 
        
        if self.last_active_date == today - timedelta(days=1):
            self.login_streak += 1 
        else:
            self.login_streak = 1  
        
        self.longest_streak = max(self.longest_streak, self.login_streak)
        self.last_active_date = today
        self.save()