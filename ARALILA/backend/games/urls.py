from django.urls import path
from . import views

urlpatterns = [
    path("sentence-construction/emoji-evaluate/", views.evaluate_emoji_sentence, name="evaluate_emoji_sentence"),
    path('areas/', views.get_unlocked_areas, name='unlocked_areas'),
    path('area/<int:area_id>/', views.get_area_detail, name='area_detail'),

    path('spelling/<int:area_id>/', views.get_spelling_questions, name='spelling_questions'),
    path('emoji/<int:area_id>/', views.get_emoji_questions, name='emoji_questions'),
    path('parts-of-speech/<int:area_id>/', views.get_parts_of_speech_questions, name='parts_of_speech_questions'),
    path('punctuation/<int:area_id>/', views.get_punctuation_questions, name='punctuation_questions'),
    path('word-association/<int:area_id>/', views.get_word_association_questions, name='word_association_questions'),
]
