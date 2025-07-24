from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CustomUser, ClassRoom, Student, Game, StudentGameProgress, StudentClassroomStats, Activity, PendingRequest, SpellingGame, PunctuationTask, PartsOfSpeech, WordMatching, FourPicsOneWord, GrammarGame, SentenceConstruction, PunctuationItem, FourPicsOneWordItem, SentenceConstructionItem

class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()  # Since it's a @property and not a model field
    # date_joined = serializers.DateField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'school_name', 'password', 'role', 'full_name', 'profile_pic', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'school_name': {'required': False},
            'profile_pic': {'required': False},
            'role': {'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def get_date_joined(self, obj):
        return obj.date_joined.date()
    
class StudentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'classroom'
        ]
    
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title', 'topic', 'description']

class GameProgressSerializer(serializers.ModelSerializer):
    game = GameSerializer()
    student = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = StudentGameProgress
        fields = ['id', 'student', 'game', 'score', 'completed', 'rank', 'updated_at']

class TeacherActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'classroom', 'title', 'description',
            'rubric', 'type', 'created_at'
        ]


class ClassroomSerializer(serializers.ModelSerializer):
    students = StudentSerializer(many=True, read_only=True)
    activities = TeacherActivitySerializer(many=True, read_only=True)
    # games = GameSerializer(many=True, read_only=True)
    total_class_score = serializers.SerializerMethodField()
    total_tasks = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'class_name', 'teacher', 'section', 
            'class_key', 'created_at', 'isActive',
            'students', 'activities',
            'total_class_score', 'total_tasks',
        ]
        extra_kwargs = {
            'teacher': {'read_only': True},
            'created_at': {'read_only': True},
        }

    def get_total_class_score(self, obj):
        return obj.total_class_score

    def get_total_tasks(self, obj):
        return obj.total_tasks


class PendingRequestSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    classroom = ClassroomSerializer()

    class Meta:
        model = PendingRequest
        fields = ['id', 'student', 'classroom', 'status', 'requested_at']

class StudentClassroomStatsSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.class_name', read_only=True)

    class Meta:
        model = StudentClassroomStats
        fields = [
            'id',
            'student',
            'student_name',
            'classroom',
            'classroom_name',
            'total_score',
            'rank',
            'progress',
        ]

class EntrySerializer(serializers.Serializer):
    description = serializers.CharField(required=False, allow_blank=True)
    word = serializers.CharField(required=False, allow_blank=True)
    sentence = serializers.CharField(required=False, allow_blank=True)
    correctAnswer = serializers.CharField(required=False, allow_blank=True)
    correctWord = serializers.CharField(required=False, allow_blank=True)
    word1 = serializers.CharField(required=False, allow_blank=True)
    word2 = serializers.CharField(required=False, allow_blank=True)
    word3 = serializers.CharField(required=False, allow_blank=True)
    word4 = serializers.CharField(required=False, allow_blank=True)
    image1 = serializers.ImageField(required=False, allow_empty_file=True)
    image2 = serializers.ImageField(required=False, allow_empty_file=True)
    image3 = serializers.ImageField(required=False, allow_empty_file=True)
    image4 = serializers.ImageField(required=False, allow_empty_file=True)

class ActivitySerializer(serializers.ModelSerializer):
    classroom = ClassroomSerializer(read_only=True)
    classroom_id = serializers.PrimaryKeyRelatedField(
        queryset=ClassRoom.objects.all(),
        write_only=True,
        source='classroom'
    )
    gameType = serializers.CharField(max_length=255, required=True)
    entries = EntrySerializer(many=True, required=False)
    game = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ['id', 'classroom', 'classroom_id', 'title', 'instructions', 'created_at', 'duration', 'status', 'due_date', 'number_of_submissions', 'gameType', 'entries', 'game']
        read_only_fields = ['id', 'classroom', 'created_at', 'number_of_submissions']

    def get_game(self, obj):
        if obj.content_type and obj.object_id:
            model = obj.content_type.model_class()
            game_instance = model.objects.get(pk=obj.object_id)
            if isinstance(game_instance, SpellingGame):
                return SpellingItemSerializer(game_instance.items.all(), many=True).data
            elif isinstance(game_instance, PartsOfSpeech):
                return PartsOfSpeechItemSerializer(game_instance.items.all(), many=True).data
            elif isinstance(game_instance, WordMatching):
                return WordMatchingItemSerializer(game_instance.items.all(), many=True).data
            elif isinstance(game_instance, GrammarGame):
                return GrammarItemSerializer(game_instance.items.all(), many=True).data
        return None
    
    def validate_classroom_id(self, value):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.teacher != request.user:
                raise serializers.ValidationError("You can only create activities for your own classrooms.")
        return value

    def create(self, validated_data):
        validated_data.pop('classroom_id')  # Remove write-only field
        game_type = validated_data.pop('gameType')
        entries = validated_data.pop('entries', [])

        # Create the Activity
        activity = Activity.objects.create(**validated_data)

        # Map gameType to the appropriate model and create the game instance
        game_mapping = {
            "Spelling Challenge Game": SpellingGame,
            "Punctuation Task": PunctuationTask,
            "Parts of Speech": PartsOfSpeech,
            "Word Matching Activity": WordMatching,
            "Four-Pics-1-Word": FourPicsOneWord,
            "Grammar Check Game": GrammarGame,
            "Sentence Construction Challenge": SentenceConstruction,
        }

        GameModel = game_mapping.get(game_type)
        if not GameModel:
            raise serializers.ValidationError(f"Unsupported game type: {game_type}")

        # Create the game instance
        game = GameModel.objects.create(title=activity.title, topic=game_type.lower().replace(" ", "_"), description=activity.instructions, default=True)

        # Link the game to the activity
        activity.content_type = ContentType.objects.get_for_model(GameModel)
        activity.object_id = game.id
        activity.save()

        # Handle entries if provided (override default items)
        if entries:
            self._create_items_from_entries(game, entries)

        return activity

    def _create_items_from_entries(self, game, entries):
        if isinstance(game, SpellingGame):
            for entry in entries:
                SpellingItem.objects.create(game=game, incorrect_word=WordBank.objects.filter(word=entry.get('description', '')).first(), correct_word=WordBank.objects.filter(word=entry.get('word', '')).first())
        elif isinstance(game, PunctuationTask):
            for entry in entries:
                PunctuationItem.objects.create(game=game, sentence=SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first(), correct_answer=entry.get('correctAnswer', ''))
        elif isinstance(game, PartsOfSpeech):
            for entry in entries:
                PartsOfSpeechItem.objects.create(game=game, sentence=SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first(), word=WordBank.objects.filter(word=entry.get('word', '')).first(), correct_answer=entry.get('correctAnswer', ''))
        elif isinstance(game, WordMatching):
            for entry in entries:
                WordMatchingItem.objects.create(game=game, sentence=SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first(), word1=WordBank.objects.filter(word=entry.get('word1', '')).first(), word2=WordBank.objects.filter(word=entry.get('word2', '')).first(), word3=WordBank.objects.filter(word=entry.get('word3', '')).first(), word4=WordBank.objects.filter(word=entry.get('word4', '')).first())
        elif isinstance(game, FourPicsOneWord):
            for entry in entries:
                FourPicsOneWordItem.objects.create(game=game, image1=entry.get('image1'), image2=entry.get('image2'), image3=entry.get('image3'), image4=entry.get('image4'), correct_answer=WordBank.objects.filter(word=entry.get('correctAnswer', '')).first())
        elif isinstance(game, GrammarGame):
            for entry in entries:
                GrammarItem.objects.create(game=game, sentence=SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first(), correct_word=WordBank.objects.filter(word=entry.get('correctWord', '')).first())
        elif isinstance(game, SentenceConstruction):
            for entry in entries:
                SentenceConstructionItem.objects.create(game=game, sentence=SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first())

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.instructions = validated_data.get('instructions', instance.instructions)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.status = validated_data.get('status', instance.status)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.save()
        return instance


from rest_framework import serializers
from .models import WordBank, SentenceBank, SpellingItem, PartsOfSpeechItem, WordMatchingItem, GrammarItem

class WordBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordBank
        fields = ['id', 'word', 'difficulty', 'part_of_speech']

class SentenceBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentenceBank
        fields = ['id', 'sentence', 'topic', 'complexity']

class SpellingItemSerializer(serializers.ModelSerializer):
    incorrect_word = WordBankSerializer(read_only=True)
    correct_word = WordBankSerializer(read_only=True)

    class Meta:
        model = SpellingItem
        fields = ['id', 'game', 'incorrect_word', 'correct_word']

class PartsOfSpeechItemSerializer(serializers.ModelSerializer):
    sentence = SentenceBankSerializer(read_only=True)
    word = WordBankSerializer(read_only=True)

    class Meta:
        model = PartsOfSpeechItem
        fields = ['id', 'game', 'sentence', 'word', 'correct_answer']

class WordMatchingItemSerializer(serializers.ModelSerializer):
    sentence = SentenceBankSerializer(read_only=True)
    word1 = WordBankSerializer(read_only=True)
    word2 = WordBankSerializer(read_only=True)
    word3 = WordBankSerializer(read_only=True)
    word4 = WordBankSerializer(read_only=True)

    class Meta:
        model = WordMatchingItem
        fields = ['id', 'game', 'sentence', 'word1', 'word2', 'word3', 'word4']

class GrammarItemSerializer(serializers.ModelSerializer):
    sentence = SentenceBankSerializer(read_only=True)
    correct_word = WordBankSerializer(read_only=True)

    class Meta:
        model = GrammarItem
        fields = ['id', 'game', 'sentence', 'correct_word']

class PartsOfSpeechItemSerializer(serializers.ModelSerializer):
    sentence = serializers.CharField(source='sentence.sentence')
    word = serializers.CharField(source='sentence.word')
    correctAnswer = serializers.CharField(source='sentence.part_of_speech')
    options = serializers.SerializerMethodField()

    class Meta:
        model = PartsOfSpeechItem
        fields = ['id', 'sentence', 'word', 'options', 'correctAnswer']

    def get_options(self, obj):
        all_options = ["Pangngalan", "Pandiwa", "Pang-uri", "Panghalip", "Pang-abay", "Pang-ukol", "Pang-angkop"]
        correct = obj.sentence.part_of_speech
        import random

        distractors = [opt for opt in all_options if opt != correct]
        sampled = random.sample(distractors, 3) if len(distractors) >= 3 else distractors

        options = sampled + [correct]
        random.shuffle(options)
        return options