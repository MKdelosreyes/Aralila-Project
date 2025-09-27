from django.db import models


# 1. Areas Table
class Area(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order_index = models.PositiveIntegerField(default=0)  # controls progression

    def __str__(self):
        return f"{self.name}"


# 2. Games Table
class Game(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

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
    item = models.OneToOneField(GameItem, on_delete=models.CASCADE, primary_key=True, related_name="pos_data")
    sentence = models.TextField()
    hint = models.TextField(blank=True)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"{self.sentence[:50]}"


class PartsOfSpeechWord(models.Model):
    pos_item = models.ForeignKey(PartsOfSpeechItem, on_delete=models.CASCADE, related_name="words")
    word = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.word}"


class PartsOfSpeechOption(models.Model):
    pos_item = models.ForeignKey(PartsOfSpeechItem, on_delete=models.CASCADE, related_name="options")
    option_text = models.CharField(max_length=100)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.option_text} ({'Correct' if self.is_correct else 'Wrong'})"
