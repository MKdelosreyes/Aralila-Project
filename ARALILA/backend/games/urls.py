from django.urls import path
from . import views

urlpatterns = [
    path("sentence-construction/emoji-evaluate/", views.evaluate_emoji_sentence, name="evaluate_emoji_sentence"),
]
