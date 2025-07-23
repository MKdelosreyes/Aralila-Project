from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.utils import timezone
import string, random, datetime

def generate_class_key():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class ProfilePicEnum(models.TextChoices):
    AVATAR1 = '/images/bear.png', 'Avatar 1'
    AVATAR2 = '/images/cat.png', 'Avatar 2'
    AVATAR3 = '/images/chicken.png', 'Avatar 3'
    AVATAR4 = '/images/owl.png', 'Avatar 4'
    AVATAR5 = '/images/panda.png', 'Avatar 5'
    DEFAULT = '/images/meerkat.png', 'Default'

class GameTopic(models.TextChoices):
    MECHANICS = "mechanics", "Mechanics"
    VOCABULARY = "vocabulary", "Vocabulary"
    GRAMMAR = "grammar", "Grammar"
    SENTENCE_STRUCTURE = "sentence_structure", "Sentence Construction"

class ActivityStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"
    DRAFT = "draft", "Draft"

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
    school_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=[('teacher', 'Teacher'), ('student', 'Student')], blank=True, null=True)
    profile_pic = models.CharField(max_length=255, choices=ProfilePicEnum.choices ,blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()
    
    def save(self, *args, **kwargs):
        if not self.pk and not self.profile_pic:
            self.profile_pic = random.choice(list(ProfilePicEnum.values))
        super().save(*args, **kwargs)


class ClassRoom(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='classes')
    class_name = models.CharField(max_length=255)
    section = models.CharField(max_length=255, default='A')
    isActive = models.BooleanField(default=True, verbose_name="Active")
    subject = models.CharField(max_length=255, blank=True)
    semester = models.CharField(max_length=255, blank=True)
    class_key = models.CharField(max_length=10, unique=True, default=generate_class_key)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.class_name} created by {self.teacher.full_name}"
    
    def save(self, *args, **kwargs):
        if self.teacher.role != 'teacher':
            raise ValidationError("Assigned user must have the role 'teacher'.")
        super().save(*args, **kwargs)

    @property
    def total_class_score(self):
        from .models import StudentClassroomStats  # Avoid circular import
        return StudentClassroomStats.objects.filter(classroom=self).aggregate(
            total=models.Sum('total_score')
        )['total'] or 0

    @property
    def total_tasks(self):
        from .models import Activity, Game
        # Count all activities assigned to this classroom + default games
        default_game_count = Game.objects.filter(default=True).count()
        activity_count = Activity.objects.filter(classroom=self).count()
        return default_game_count + activity_count



class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    classroom = models.ForeignKey(ClassRoom, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    def __str__(self):
        return f"{self.user.full_name} in {self.classroom}"
    

class Game(models.Model):
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=50, choices=GameTopic.choices)
    description = models.TextField(blank=True)
    default = models.BooleanField(default=True) 

    def __str__(self):
        return self.title
    

class Activity(models.Model):
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    rubric = models.TextField(blank=True)  # plain textarea for now
    status = models.CharField(max_length=50, choices=ActivityStatus.choices, blank=True, default='Active')
    due_date = models.DateTimeField(
        null=False,
        blank=False,
        default=datetime.date.today, 
        help_text="Deadline for the activity (YYYY-MM-DD HH:MM:SS)"
    )
    number_of_submissions = models.PositiveIntegerField(null=True, blank=True, default=0)
    
    def __str__(self):
        return self.title 


class StudentGameProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    score = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'game')


class StudentClassroomStats(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='classroom_stats')
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='student_stats')

    # New: Overall stats
    total_score = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(null=True, blank=True)
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)  # as a percentage

    class Meta:
        unique_together = ('student', 'classroom')


class StudentActivitySubmission(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    submission_text = models.TextField()
    feedback = models.TextField(blank=True)
    score = models.PositiveIntegerField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'activity')


class PendingRequest(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE)
    requested_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='pending')

    class Meta:
        unique_together = ('student', 'classroom')

    def __str__(self):
        return f"{self.student.user.full_name} - {self.classroom.class_name} ({self.status})"
