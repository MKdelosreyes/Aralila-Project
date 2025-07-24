from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from .serializers import CustomUserSerializer, ClassroomSerializer, StudentSerializer, StudentClassroomStatsSerializer, ActivitySerializer
from .models import CustomUser, ClassRoom, Student, Game, StudentGameProgress, Activity, StudentClassroomStats, SpellingGame, PunctuationTask, PartsOfSpeech, WordMatching, FourPicsOneWord, GrammarGame, SentenceConstruction
from .models import WordBank, SentenceBank, SpellingItem, WordMatchingItem, PartsOfSpeechItem, GrammarItem, PartsOfSpeech 
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from collections import Counter
from .serializers import PartsOfSpeechItemSerializer
from rest_framework import status
import random

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({"message": "pong!"})


class CreateUserView(generics.CreateAPIView):
    User = get_user_model()
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
class CreateClassroomView(generics.CreateAPIView):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    
class ClassRoomView(generics.RetrieveAPIView):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class ClassRoomListView(generics.ListAPIView):
    # queryset = ClassRoom.objects.filter(teacher=request.user)
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClassRoom.objects.filter(teacher=self.request.user)
    
class ClassroomStudentListView(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        classroom_id = self.kwargs['pk']
        return Student.objects.filter(classroom_id=classroom_id)
    
class CreateStudentView(generics.CreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

class ClassroomDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, classroom_id):
        try:
            classroom = ClassRoom.objects.get(id=classroom_id, teacher=request.user)
        except ClassRoom.DoesNotExist:
            return Response({"error": "Classroom not found or unauthorized."}, status=404)

        students = Student.objects.filter(classroom=classroom)
        default_games_count = (
            SpellingGame.objects.filter(default=True).count() +
            PunctuationTask.objects.filter(default=True).count() +  
            PartsOfSpeech.objects.filter(default=True).count() +
            WordMatching.objects.filter(default=True).count() + 
            FourPicsOneWord.objects.filter(default=True).count() +
            GrammarGame.objects.filter(default=True).count() +
            SentenceConstruction.objects.filter(default=True).count()
        )
        
        # default_games_count = Game.objects.count()  # e.g., 8–10
        student_data = []
        total_class_score = 0
        level_counts = Counter()

        expected_topics = ["Mekaniks ng Pagsulat", "Bokabularyo", "Gramatika sa Pagsulat", "Pagbuo ng Pangungusap"]

        spelling_game_ct = ContentType.objects.get_for_model(SpellingGame)
        punctuationtask_ct = ContentType.objects.get_for_model(PunctuationTask)
        parts_of_speech_ct = ContentType.objects.get_for_model(PartsOfSpeech)
        word_matching_ct = ContentType.objects.get_for_model(WordMatching)
        four_pics_one_word_ct = ContentType.objects.get_for_model(FourPicsOneWord)
        grammar_game_ct = ContentType.objects.get_for_model(GrammarGame)
        sentence_construction_ct = ContentType.objects.get_for_model(SentenceConstruction)  

        spelling_game_id = SpellingGame.objects.filter(default=True).values_list('id', flat=True)
        punctuationtask_id = PunctuationTask.objects.filter(default=True).values_list('id', flat=True)
        parts_of_speech_id = PartsOfSpeech.objects.filter(default=True).values_list('id', flat=True)
        word_matching_id = WordMatching.objects.filter(default=True).values_list('id', flat=True)
        four_pics_one_word_id = FourPicsOneWord.objects.filter(default=True).values_list('id', flat=True)
        grammar_game_id = GrammarGame.objects.filter(default=True).values_list('id', flat=True)
        sentence_construction_id = SentenceConstruction.objects.filter(default=True).values_list('id', flat =True)

        for student in students:
            game_progresses = StudentGameProgress.objects.filter(
                student=student
            ).filter(
                (
                    Q(content_type=spelling_game_ct, object_id__in=spelling_game_id) |
                    Q(content_type=punctuationtask_ct, object_id__in=punctuationtask_id) |
                    Q(content_type=parts_of_speech_ct, object_id__in=parts_of_speech_id) |
                    Q(content_type=word_matching_ct, object_id__in=word_matching_id) |  
                    Q(content_type=four_pics_one_word_ct, object_id__in=four_pics_one_word_id) |
                    Q(content_type=grammar_game_ct, object_id__in=grammar_game_id) |    
                    Q(content_type=sentence_construction_ct, object_id__in=sentence_construction_id)
                )
            )

            completed_games = game_progresses.count()
            progress_percent = int((completed_games / default_games_count) * 100) if default_games_count else 0

            category_scores = {topic: 0 for topic in expected_topics}
            for gp in game_progresses:
                topic = gp.game.topic
                if topic in category_scores:
                    category_scores[topic] += gp.score

            total_score = sum(category_scores.values())
            total_class_score += total_score

            # Determine level based on total score (you can customize logic)
            if total_score >= 80:
                level = 'Advanced'
            elif total_score >= 50:
                level = 'Intermediate'
            else:
                level = 'Beginning'
            level_counts[level] += 1

            student_data.append({
                "id": student.user.id,
                "email": student.user.email,
                "full_name": student.user.full_name,
                "profile_pic": student.user.profile_pic if student.user.profile_pic else None,
                "date_joined": student.user.date_joined.strftime("%Y-%m-%d"),
                "overall_score": total_score,
                "progress": f"{progress_percent}%",
                "Mechanics": category_scores["Mekaniks ng Pagsulat"],
                "Vocabulary": category_scores["Bokabularyo"],
                "Grammar": category_scores["Gramatika sa Pagsulat"],
                "Sentence_Construction": category_scores["Pagbuo ng Pangungusap"],
            })

        student_data.sort(key=lambda x: x['overall_score'], reverse=True)
        for idx, student in enumerate(student_data):
            student["rank"] = idx + 1

        average_score = int(total_class_score / len(student_data)) if student_data else 0
        activity_count = Activity.objects.filter(classroom=classroom).count()
        total_tasks = default_games_count + activity_count

        return Response({
            "class_name": classroom.class_name,
            "section": classroom.section,
            "status": "ACTIVE" if classroom.isActive else "INACTIVE",
            "class_key": classroom.class_key,
            "overall_score": average_score,
            "tasks_assigned": total_tasks,
            "students": student_data,
            "levels": {
                "Advanced": {
                    "count": level_counts["Advanced"],
                    "label": "Mahusay",
                    "percent": int((level_counts["Advanced"] / len(students)) * 100) if students else 0
                },
                "Intermediate": {
                    "count": level_counts["Intermediate"],
                    "label": "Katamtaman",
                    "percent": int((level_counts["Intermediate"] / len(students)) * 100) if students else 0
                },
                "Beginning": {
                    "count": level_counts["Beginning"],
                    "label": "Paunang",
                    "percent": int((level_counts["Beginning"] / len(students)) * 100) if students else 0
                }
            }
        })
    

class TeacherActivitiesViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            classrooms = ClassRoom.objects.filter(teacher=user)
            return Activity.objects.filter(classroom__in=classrooms)
        return Activity.objects.none()

    def perform_create(self, serializer):
        validated_data = serializer.validated_data
        classroom_id = self.kwargs.get('classroom_id')
        game_type = validated_data.pop('gameType')
        entries = validated_data.pop('entries', [])

        classroom = ClassRoom.objects.get(id=classroom_id)
        if classroom.teacher != self.request.user:
            raise ValidationError("You can only create activities for your own classrooms.")

        activity = Activity.objects.create(classroom=classroom, **validated_data)

        game_mapping = {
            "Spelling Challenge Game": SpellingGame,
            "Parts of Speech": PartsOfSpeech,
            "Word Matching Activity": WordMatching,
            "Grammar Check Game": GrammarGame,
        }

        GameModel = game_mapping.get(game_type)
        if not GameModel:
            raise ValidationError(f"Unsupported game type: {game_type}")

        game = GameModel.objects.create(
            title=activity.title,
            topic=game_type.lower().replace(" ", "_"),
            description=activity.instructions,
            default=True
        )

        activity.content_type = ContentType.objects.get_for_model(GameModel)
        activity.object_id = game.id
        activity.save()

        if entries:
            self._create_items_from_entries(game, entries)

        serializer.save()

    def _create_items_from_entries(self, game, entries):
        if isinstance(game, SpellingGame):
            for entry in entries:
                incorrect_word = WordBank.objects.filter(word=entry.get('description', '')).first()
                correct_word = WordBank.objects.filter(word=entry.get('word', '')).first()
                if incorrect_word and correct_word:
                    SpellingItem.objects.create(game=game, incorrect_word=incorrect_word, correct_word=correct_word)
        elif isinstance(game, PartsOfSpeech):
            for entry in entries:
                sentence = SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first()
                word = WordBank.objects.filter(word=entry.get('word', '')).first()
                correct_answer = entry.get('correctAnswer', '')
                if sentence and word:
                    PartsOfSpeechItem.objects.create(game=game, sentence=sentence, word=word, correct_answer=correct_answer)
        elif isinstance(game, WordMatching):
            for entry in entries:
                sentence = SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first()
                word1 = WordBank.objects.filter(word=entry.get('word1', '')).first()
                word2 = WordBank.objects.filter(word=entry.get('word2', '')).first()
                word3 = WordBank.objects.filter(word=entry.get('word3', '')).first()
                word4 = WordBank.objects.filter(word=entry.get('word4', '')).first()
                if sentence and word1 and word2 and word3 and word4:
                    WordMatchingItem.objects.create(game=game, sentence=sentence, word1=word1, word2=word2, word3=word3, word4=word4)
        elif isinstance(game, GrammarGame):
            for entry in entries:
                sentence = SentenceBank.objects.filter(sentence=entry.get('sentence', '')).first()
                correct_word = WordBank.objects.filter(word=entry.get('correctWord', '')).first()
                if sentence and correct_word:
                    GrammarItem.objects.create(game=game, sentence=sentence, correct_word=correct_word)

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.classroom.teacher != self.request.user:
            raise permissions.PermissionDenied("You can only edit activities for your own classrooms.")
        serializer.save()

    @action(detail=False, methods=['get'])
    def my_activities(self, request):
        activities = self.get_queryset()
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)

class PartsOfSpeechGameView(APIView):
    def get(self, request):
        ids = list(PartsOfSpeechItem.objects.values_list('id', flat=True))
        selected_ids = random.sample(ids, min(10, len(ids)))
        items = PartsOfSpeechItem.objects.filter(id__in=selected_ids)
        serializer = PartsOfSpeechItemSerializer(items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user = request.user
        data = request.data
        score = data.get('score')
        results = data.get('results', [])
        game_id = data.get('game_id')

        # Get student
        student = getattr(user, 'student', None)
        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the content type for PartsOfSpeechGame
        try:
            game_instance = PartsOfSpeechGame.objects.get(id=game_id)
        except PartsOfSpeechGame.DoesNotExist:
            return Response({'error': 'Game not found.'}, status=status.HTTP_404_NOT_FOUND)

        content_type = ContentType.objects.get_for_model(PartsOfSpeechGame)

        # Save progress
        StudentGameProgress.objects.create(
            student=student,
            content_type=content_type,
            object_id=game_instance.id,
            score=score
        )

        return Response({'message': 'Score saved!'}, status=status.HTTP_201_CREATED)