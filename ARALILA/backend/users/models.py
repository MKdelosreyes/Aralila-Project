from django.db import models
import random
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin 

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

    # New JSON field for badges
    collected_badges = models.JSONField(default=list, blank=True, help_text="List of collected badge identifiers")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login_date = models.DateField(null=True, blank=True)

    # Fix the clashing reverse accessors
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='customuser_set',  # Changed from 'user_set'
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_set',  # Changed from 'user_set'
        related_query_name='customuser',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Email is already the USERNAME_FIELD
    
    class Meta:
        pass

    def __str__(self):
        return f"{self.email}"

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()
    
    def save(self, *args, **kwargs):
        # Auto-assign random profile pic on creation
        if not self.profile_pic:
            self.profile_pic = random.choice(list(ProfilePicEnum.values))
        super().save(*args, **kwargs)
