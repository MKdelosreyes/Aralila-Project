from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
import string, random

def generate_class_key():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        
        if not extra_fields.get('username'):
            if email.endswith('@gmail.com'):
                extra_fields['username'] = email.replace('@gmail.com', '')
            else:
                extra_fields['username'] = email.split('@')[0]

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
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    school_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=[('teacher', 'Teacher'), ('student', 'Student')], blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    classroom = models.ForeignKey('ClassRoom', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Required for superuser creation

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()



class ClassRoom(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=255)
    class_key = models.CharField(max_length=10, unique=True, default=generate_class_key)

    def __str__(self):
        # teacher: 'CustomUser' = self.teacher 
        return f"{self.name} created by teacher"
