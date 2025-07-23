from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from .serializers import CustomUserSerializer, ClassroomSerializer, StudentSerializer, StudentClassroomStatsSerializer
from .models import CustomUser, ClassRoom, Student, Game, StudentGameProgress, Activity, StudentClassroomStats
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from collections import Counter

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
        default_games = Game.objects.filter(default=True)
        default_games_count = default_games.count()
        
        # default_games_count = Game.objects.count()  # e.g., 8–10
        student_data = []
        total_class_score = 0
        level_counts = Counter()

        expected_topics = ["Mekaniks ng Pagsulat", "Bokabularyo", "Gramatika sa Pagsulat", "Pagbuo ng Pangungusap"]

        for student in students:
            game_progresses = StudentGameProgress.objects.filter(student=student, game__default=True)

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