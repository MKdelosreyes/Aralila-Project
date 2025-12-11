from django.urls import path
from . import views

urlpatterns = [
    path("sentence-construction/emoji-evaluate/", views.evaluate_emoji_sentence, name="evaluate_emoji_sentence"),
    path('areas/', views.get_unlocked_areas, name='unlocked_areas'),
    path('area/<int:area_id>/', views.get_area_detail, name='area_detail'),
    path('area/order/<int:order_index>/', views.get_area_by_order, name='area_by_order'),

    path('questions/<int:area_id>/<str:game_type>/<int:difficulty>/', 
         views.get_game_questions_by_difficulty, 
         name='get_game_questions_by_difficulty'),
    path('submit-score/', views.submit_game_score, name='submit_game_score'),

    path('spelling/<int:area_id>/', views.get_spelling_questions, name='spelling_questions'),
    path('grammar-check/<int:area_id>/', views.get_grammar_questions, name='grammar_check_questions'),
    path('emoji/<int:area_id>/', views.get_emoji_questions, name='emoji_questions'),
    path('parts-of-speech/<int:area_id>/', views.get_parts_of_speech_questions, name='parts_of_speech_questions'),
    path('punctuation/<int:area_id>/', views.get_punctuation_questions, name='punctuation_questions'),
    path('word-association/<int:area_id>/', views.get_word_association_questions, name='word_association_questions'),

    path('assessment/<int:area_id>/', views.get_assessment_lesson, name='assessment_lesson'),
    path('assessment/submit-challenge/', views.submit_assessment_challenge, name='submit_challenge'),
    path('assessment/reduce-hearts/', views.reduce_hearts, name='reduce_hearts'),
    path('assessment/complete/', views.complete_assessment, name='complete_assessment'),
    path('assessment/validate-answer/', views.validate_challenge_answer, name='validate_answer'),
    path('assessment/reset/', views.reset_assessment, name='assessment-reset'),
    path('evaluate-compose/', views.evaluate_compose_answer, name='evaluate_compose'),
]