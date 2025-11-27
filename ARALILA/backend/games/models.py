from django.db import models
from django.conf import settings

# 1. Areas Table
class Area(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order_index = models.PositiveIntegerField(default=0)  
    theme_color = models.CharField(max_length=7, default="#4A90E2")  # For UI theming
    icon = models.CharField(max_length=50, blank=True)  
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order_index']  
        verbose_name_plural = "Areas"

    def __str__(self):
        return f"{self.name}"


# 2. Games Table
class Game(models.Model):
    GAME_TYPE_CHOICES = [
        ('spelling-challenge', 'Spelling Challenge'),
        ('punctuation-task', 'Punctuation Task'),
        ('parts-of-speech', 'Parts of Speech'),
        ('word-association', 'Word Association'),
        ('emoji-challenge', 'Emoji Challenge'),
        ('grammar-check', 'Grammar Check'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    game_type = models.CharField(max_length=50, choices=GAME_TYPE_CHOICES, blank=True)  # 👈 Add this
    icon = models.CharField(max_length=10, blank=True)  
    order_index = models.PositiveIntegerField(default=0)  

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return f"{self.name}"


# 3. GameItems (Master Table)
class GameItem(models.Model):
    DIFFICULTY_CHOICES = [
        (1, "Easy"),
        (2, "Medium"),
        (3, "Hard"),
    ]

    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="items")
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="items")
    difficulty = models.IntegerField(choices=DIFFICULTY_CHOICES, default=1)
    order_index = models.PositiveIntegerField(default=0)  

    class Meta:
        ordering = ['difficulty', 'order_index'] 
        unique_together = ['game', 'area', 'difficulty', 'order_index']  

    def __str__(self):
        return f"{self.game.name} - {self.area.name} ({self.get_difficulty_display()})"


# 4A. Spelling Game
class SpellingItem(models.Model):
    item = models.OneToOneField(GameItem, on_delete=models.CASCADE, primary_key=True, related_name="spelling_data")
    word = models.CharField(max_length=100)
    sentence = models.TextField()

    def __str__(self):
        return f"{self.word}"


# 4B. Punctuation Game
class PunctuationItem(models.Model):
    item = models.OneToOneField(GameItem, on_delete=models.CASCADE, primary_key=True, related_name="punctuation_data")
    sentence = models.TextField()
    hint = models.TextField(blank=True)

    def __str__(self):
        return f"{self.sentence[:50]}"


class PunctuationAnswer(models.Model):
    punctuation_item = models.ForeignKey(PunctuationItem, on_delete=models.CASCADE, related_name="answers")
    position = models.IntegerField()
    mark = models.CharField(max_length=5)  # e.g. ',', '.', '?', '!'

    def __str__(self):
        return f"{self.mark} at {self.position}"


# 4C. Parts of Speech Game
class PartsOfSpeechItem(models.Model):
    item = models.OneToOneField(
        GameItem,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="pos_data"
    )
    sentence = models.TextField()
    hint = models.TextField(blank=True)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"{self.sentence[:50]}"


class PartsOfSpeechWord(models.Model):
    pos_item = models.ForeignKey(
        PartsOfSpeechItem,
        on_delete=models.CASCADE,
        related_name="words"
    )
    word = models.CharField(max_length=100)
    correct_answer = models.CharField(max_length=100)   

    def __str__(self):
        return f"{self.word} → {self.correct_answer}"


# class PartsOfSpeechOption(models.Model):
#     word = models.ForeignKey(   # ⬅️ now tied to a specific word, not the whole sentence
#         PartsOfSpeechWord,
#         on_delete=models.CASCADE,
#         related_name="options"
#     )
#     option_text = models.CharField(max_length=100)
#     is_correct = models.BooleanField(default=False)

#     def __str__(self):
#         return f"{self.option_text} for {self.word.word} ({'Correct' if self.is_correct else 'Wrong'})"


class FourPicsOneWordItem(models.Model):
    item = models.OneToOneField(
        GameItem,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="fourpics_data"
    )
    answer = models.CharField(max_length=100)
    hint = models.TextField(blank=True)

    def __str__(self):
        return f"4Pics1Word: {self.answer}"


class FourPicsOneWordImage(models.Model):
    fourpics_item = models.ForeignKey(
        FourPicsOneWordItem,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image_path = models.CharField(max_length=255)

    def __str__(self):
        return f"Image for {self.fourpics_item.answer}: {self.image_path}"


# Grammar Game
class GrammarItem(models.Model):
    item = models.OneToOneField(GameItem, on_delete=models.CASCADE, primary_key=True, related_name="grammar_data")
    sentence = models.TextField()

    def __str__(self):
        return f"{self.sentence[:50]}"


class EmojiSentenceItem(models.Model):
    item = models.OneToOneField(
        GameItem,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="emoji_data"
    )
    translation = models.TextField()  

    def __str__(self):
        return f"EmojiSentence: {self.translation[:50]}"


class EmojiSymbol(models.Model):
    emoji_item = models.ForeignKey(
        EmojiSentenceItem,
        on_delete=models.CASCADE,
        related_name="emojis"
    )
    symbol = models.CharField(max_length=10)  
    keyword = models.CharField(max_length=100)  

    def __str__(self):
        return f"{self.symbol} ({self.keyword})"
    

class GameRoom(models.Model):
    game = models.ForeignKey(
        'Game', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='multiplayer_rooms'
    )
    room_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="active")
    total_images = models.PositiveIntegerField(default=5)
    current_image_index = models.PositiveIntegerField(default=0)
    topic = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.room_name


class GamePlayer(models.Model):
    room = models.ForeignKey(GameRoom, on_delete=models.CASCADE, related_name="players")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    joined_at = models.DateTimeField(auto_now_add=True)


class GameRound(models.Model):
    room = models.ForeignKey(GameRoom, on_delete=models.CASCADE, related_name="rounds")
    image_url = models.URLField(blank=True, null=True)
    round_index = models.PositiveIntegerField()
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    group_score = models.IntegerField(default=0)  # AI evaluation result
    evaluated_sentence = models.TextField(blank=True, null=True)


class SentenceContribution(models.Model):
    round = models.ForeignKey(GameRound, on_delete=models.CASCADE, related_name="contributions")
    player = models.ForeignKey(GamePlayer, on_delete=models.CASCADE)
    word_or_phrase = models.CharField(max_length=255)
    turn_order = models.PositiveIntegerField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    was_skipped = models.BooleanField(default=False)


class SentenceEvaluation(models.Model):
    round = models.OneToOneField(GameRound, on_delete=models.CASCADE, related_name="evaluation")
    grammar_score = models.FloatField(default=0)
    coherence_score = models.FloatField(default=0)
    overall_score = models.FloatField(default=0)
    feedback = models.TextField(blank=True, null=True)
