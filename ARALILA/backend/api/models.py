from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from datetime import timedelta
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
        from .models import Activity, SpellingGame, PunctuationTask, PartsOfSpeech, WordMatching, FourPicsOneWord, GrammarGame, SentenceConstruction

        default_game_count = (
            SpellingGame.objects.filter(default=True).count() +
            PunctuationTask.objects.filter(default=True).count() +
            PartsOfSpeech.objects.filter(default=True).count() + 
            WordMatching.objects.filter(default=True).count() +
            FourPicsOneWord.objects.filter(default=True).count() +  
            GrammarGame.objects.filter(default=True).count() +
            SentenceConstruction.objects.filter(default=True).count()
        )
        activity_count = Activity.objects.filter(classroom=self).count()
        return default_game_count + activity_count



class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    classroom = models.ForeignKey(ClassRoom, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    def __str__(self):
        return f"{self.user.full_name} in {self.classroom}"


class WordBank(models.Model):
    word = models.CharField(max_length=255, unique=True)
    difficulty = models.CharField(max_length=20, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')], default='medium')
    part_of_speech = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.word

class SentenceBank(models.Model):
    sentence = models.TextField(unique=True)
    word = models.CharField(max_length=20, blank=True)
    complexity = models.CharField(max_length=20, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')], default='medium')
    part_of_speech = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.sentence
    

class Game(models.Model):
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=50, choices=GameTopic.choices)
    description = models.TextField(blank=True)
    default = models.BooleanField(default=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.items.exists() and self._meta.model_name not in ['fourpicsoneword', 'sentenceconstruction']:  # Exclude games without items
            self._create_default_items()

    def _create_default_items(self):
        # Override in specific game models to create 10 items
        pass
    

class SpellingGame(Game):
    progress_records = GenericRelation('StudentGameProgress')

    def _create_default_items(self):
        from .models import SpellingItem
        for _ in range(10):
            SpellingItem.objects.create(game=self, incorrect_word=WordBank.objects.order_by('?').first(), correct_word=WordBank.objects.order_by('?').first())

class SpellingItem(models.Model):
    game = models.ForeignKey(SpellingGame, on_delete=models.CASCADE, related_name='items')
    incorrect_word = models.ForeignKey(WordBank, on_delete=models.SET_NULL, blank=True, null=True, related_name='spelling_incorrect_items')
    correct_word = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True, related_name='spelling_correct_items')

    def __str__(self):
        return f"{self.incorrect_word} -> {self.correct_word}"

class PunctuationTask(Game):
    progress_records = GenericRelation('StudentGameProgress')

    def _create_default_items(self):
        from .models import PunctuationItem
        for _ in range(10):
            PunctuationItem.objects.create(game=self, sentence=SentenceBank.objects.order_by('?').first())

class PunctuationItem(models.Model):
    game = models.ForeignKey(PunctuationTask, on_delete=models.CASCADE, related_name='items')
    sentence = models.ForeignKey(SentenceBank, on_delete=models.SET_NULL, null=True)
    correct_answer = models.TextField()

    def __str__(self):
        return self.sentence.sentence

class PartsOfSpeech(Game):
    progress_records = GenericRelation('StudentGameProgress')

    def _create_default_items(self):
        from .models import PartsOfSpeechItem
        for _ in range(10):
            PartsOfSpeechItem.objects.create(game=self, sentence=SentenceBank.objects.order_by('?').first())

class PartsOfSpeechItem(models.Model):
    game = models.ForeignKey(PartsOfSpeech, on_delete=models.CASCADE, related_name='items')
    sentence = models.ForeignKey(SentenceBank, on_delete=models.SET_NULL, null=True)
    # word = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True)
    # correct_answer = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.sentence}"

class WordMatching(Game):
    progress_records = GenericRelation('StudentGameProgress')

    def _create_default_items(self):
        from .models import WordMatchingItem
        for _ in range(10):
            WordMatchingItem.objects.create(game=self, sentence=SentenceBank.objects.order_by('?').first())

class WordMatchingItem(models.Model):
    game = models.ForeignKey(WordMatching, on_delete=models.CASCADE, related_name='items')
    sentence = models.ForeignKey(SentenceBank, on_delete=models.SET_NULL, null=True)
    word1 = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True, related_name='wordmatch1_items')
    word2 = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True, related_name='wordmatch2_items')
    word3 = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True, related_name='wordmatch3_items')
    word4 = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True, related_name='wordmatch4_items')

    def __str__(self):
        return self.sentence.sentence

class FourPicsOneWord(Game):
    progress_records = GenericRelation('StudentGameProgress')

    def _create_default_items(self):
        from .models import FourPicsOneWordItem
        for _ in range(10):
            FourPicsOneWordItem.objects.create(game=self)

class FourPicsOneWordItem(models.Model):
    game = models.ForeignKey(FourPicsOneWord, on_delete=models.CASCADE, related_name='items')
    image1 = models.ImageField(upload_to='game_images/')
    image2 = models.ImageField(upload_to='game_images/')
    image3 = models.ImageField(upload_to='game_images/')
    image4 = models.ImageField(upload_to='game_images/')
    correct_answer = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Item for {self.game.title}"

class GrammarGame(Game):
    progress_records = GenericRelation('StudentGameProgress')

    def _create_default_items(self):
        from .models import GrammarItem
        for _ in range(10):
            GrammarItem.objects.create(game=self, sentence=SentenceBank.objects.order_by('?').first())

class GrammarItem(models.Model):
    game = models.ForeignKey(GrammarGame, on_delete=models.CASCADE, related_name='items')
    sentence = models.ForeignKey(SentenceBank, on_delete=models.SET_NULL, null=True)
    correct_word = models.ForeignKey(WordBank, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.sentence.sentence

class SentenceConstruction(Game):
    progress_records = GenericRelation('StudentGameProgress')

    def _create_default_items(self):
        from .models import SentenceConstructionItem
        for _ in range(10):
            SentenceConstructionItem.objects.create(game=self, sentence=SentenceBank.objects.order_by('?').first())

class SentenceConstructionItem(models.Model):
    game = models.ForeignKey(SentenceConstruction, on_delete=models.CASCADE, related_name='items')
    sentence = models.ForeignKey(SentenceBank, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.sentence.sentence

class Activity(models.Model):
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(
        default=timedelta(hours=1),
        help_text="Time limit to complete the activity once started (e.g., 1:00:00 for 1 hour)"
    )
    status = models.CharField(max_length=50, choices=ActivityStatus.choices, blank=True, default='active')
    due_date = models.DateTimeField(
        null=False,
        blank=False,
        default=datetime.date.today,
        help_text="Deadline for the activity (YYYY-MM-DD HH:MM:SS)"
    )
    number_of_submissions = models.PositiveIntegerField(null=True, blank=True, default=0)

    # Generic relation to Game models
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    game = GenericForeignKey('content_type', 'object_id')
    
    def __str__(self):
        return self.title 


class StudentGameProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    game = GenericForeignKey('content_type', 'object_id')

    class Meta:
        db_table = 'api_studentgameprogress'

    score = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(null=True, blank=True)

    # def save(self, *args, **kwargs):
    #     if not self.content_type:
    #         spelling_game_type = ContentType.objects.get_for_model(SpellingGame)
    #         self.content_type = spelling_game_type
    #     super().save(*args, **kwargs)

    def save(self, *args, **kwargs):
    # Remove hardcoded default. Instead, require content_type to be passed explicitly
        if not self.content_type or not self.object_id:
            raise ValueError("Both content_type and object_id must be set for StudentGameProgress.")
        super().save(*args, **kwargs)



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
