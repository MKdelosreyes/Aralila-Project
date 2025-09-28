from django.db import models
from django.contrib.auth.models import User, AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import string, random, datetime


class ProfilePicEnum(models.TextChoices):
    AVATAR1 = '/images/bear.png', 'Avatar 1'
    AVATAR2 = '/images/cat.png', 'Avatar 2'
    AVATAR3 = '/images/chicken.png', 'Avatar 3'
    AVATAR4 = '/images/owl.png', 'Avatar 4'
    AVATAR5 = '/images/panda.png', 'Avatar 5'
    DEFAULT = '/images/meerkat.png', 'Default'

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
    

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    school_name = models.CharField(max_length=255, blank=True, null=True)
    profile_pic = models.CharField(max_length=255, choices=ProfilePicEnum.choices ,blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email}"

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()
    
    def save(self, *args, **kwargs):
        if not self.pk and not self.profile_pic:
            self.profile_pic = random.choice(list(ProfilePicEnum.values))
        super().save(*args, **kwargs)