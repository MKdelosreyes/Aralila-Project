from django.urls import path
from . import views
from .views import UserProfileView, CreateClassroomView, ClassRoomView, ClassRoomListView, ClassroomStudentListView, CreateStudentView, ClassroomDashboardView

urlpatterns = [
    path('ping/', views.ping),  # http://127.0.0.1:8000/api/ping/
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('classroom/create/', CreateClassroomView.as_view(), name='create-classroom'),
    path('classroom/<int:id>/', ClassRoomView.as_view(), name='retrieve-classroom'),
    path('classrooms/', ClassRoomListView.as_view(), name='classroom-list'),
    path('classroom/<int:pk>/students/', ClassroomStudentListView.as_view(), name='classroom-students'),
    path('student/create/', CreateStudentView.as_view(), name='create-student'),
    path('classroom/<int:classroom_id>/dashboard/', ClassroomDashboardView.as_view(), name='classroom-dashboard'),
]