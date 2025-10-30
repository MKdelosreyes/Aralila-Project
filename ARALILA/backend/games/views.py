from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Max, Count, Q
from .models import Area, Game, GameItem
from progress.models import GameProgress
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

MINIMUM_SCORE_THRESHOLD = 70  # 70% average required

# Load .env variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@csrf_exempt
def evaluate_emoji_sentence(request):
    data = json.loads(request.body)
    student_answer = data.get("answer", "")
    emojis = data.get("emojis", [])

    # Build the prompt for evaluation
    prompt = f"""
        You are a Filipino language teacher. 
        Keywords shown to the student: {emojis}
        Student's sentence: "{student_answer}"

        The student's answer must be pure Filipino text (no emojis).

        Please:
        1. Check if it is grammatically correct in Filipino.
        2. Check if the meaning matches the given key concepts ({emojis}). 
        It is acceptable if not every keyword is mentioned literally, as long as the main idea is correct.
        3. Give a short explanation (in Filipino) about what is right or wrong.
        4. Provide a corrected version if needed.

        Respond ONLY in valid JSON with keys:
        valid (true/false), explanation (string), corrected (string).
        """


    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",   # 💡 you can also use gpt-5-mini if available
            messages=[
                {"role": "system", "content": "You are a helpful teacher."},
                {"role": "user", "content": prompt}
            ]
        )

        raw_text = response.choices[0].message.content

        # Try parsing into JSON
        result = {}
        try:
            # remove code fences if present
            cleaned = raw_text.strip().replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            result = {
                "valid": False,
                "explanation": "AI did not return valid JSON.",
                "corrected": raw_text
            }

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unlocked_areas(request):
    """Get all areas with lock/unlock status and progress for current user"""
    print(f"User: {request.user}")  # Debug: Check if user is authenticated
    print(f"Is authenticated: {request.user.is_authenticated}")

    all_areas = Area.objects.filter(is_active=True).order_by('order_index')
    areas_data = []
    
    for index, area in enumerate(all_areas):
        # Get all games for this area
        game_items = GameItem.objects.filter(area=area).select_related('game')
        total_games = game_items.count()
        
        # Get user's progress for this area
        progress_records = GameProgress.objects.filter(
            user=request.user,
            area=area,
            completed=True
        ).values('game').annotate(
            best_score=Max('score')
        )
        
        completed_games = progress_records.count()
        
        # Calculate average score
        best_scores = [p['best_score'] for p in progress_records]
        average_score = sum(best_scores) / len(best_scores) if best_scores else 0
        
        # Determine if area is locked
        is_locked = False
        message = ""
        
        if index == 0:
            # First area is always unlocked
            is_locked = False
            message = "Start your journey here!"
        else:
            # Check if previous area is completed
            previous_area = all_areas[index - 1]
            previous_progress = GameProgress.objects.filter(
                user=request.user,
                area=previous_area,
                completed=True
            ).values('game').annotate(
                best_score=Max('score')
            )
            
            prev_completed = previous_progress.count()
            prev_total = GameItem.objects.filter(area=previous_area).count()
            prev_scores = [p['best_score'] for p in previous_progress]
            prev_avg = sum(prev_scores) / len(prev_scores) if prev_scores else 0
            
            # Check completion criteria
            if prev_completed < prev_total:
                is_locked = True
                message = f"Complete all games in {previous_area.name} to unlock"
            elif prev_avg < MINIMUM_SCORE_THRESHOLD:
                is_locked = True
                message = f"Achieve 70% average in {previous_area.name} (current: {prev_avg:.0f}%)"
            else:
                is_locked = False
                message = "Unlocked!"
        
        areas_data.append({
            'id': area.id,
            'name': area.name,
            'description': area.description,
            'is_locked': is_locked,
            'completed_games': completed_games,
            'total_games': total_games,
            'average_score': round(average_score, 1),
            'message': message,
            'theme_color': area.theme_color,
            'icon': area.icon
        })
    
    return Response({'areas': areas_data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_area_detail(request, area_id):
    """Get detailed information about a specific area and its games"""
    
    try:
        area = Area.objects.get(id=area_id, is_active=True)
    except Area.DoesNotExist:
        return Response({'error': 'Area not found'}, status=404)
    
    # Get all unique games for this area
    game_items = GameItem.objects.filter(area=area).select_related('game').distinct('game')
    
    games_data = []
    for item in game_items:
        game = item.game
        
        # Get user's best progress for this game in this area
        best_progress = GameProgress.objects.filter(
            user=request.user,
            area=area,
            game=game
        ).order_by('-score').first()
        
        # Count attempts
        attempts = GameProgress.objects.filter(
            user=request.user,
            area=area,
            game=game
        ).count()
        
        # ✅ Use the game_type field directly from the Game model
        game_type = game.game_type if game.game_type else 'unknown'
        icon = game.icon if game.icon else '🎮'
        
        games_data.append({
            'id': game.id,
            'name': game.name,
            'description': game.description,
            'game_type': game_type,  # ✅ This will now return 'spelling-challenge', 'emoji-challenge', etc.
            'icon': icon,
            'best_score': best_progress.score if best_progress else 0,
            'completed': best_progress.completed if best_progress else False,
            'attempts': attempts
        })
    
    # Calculate area statistics
    completed_count = sum(1 for g in games_data if g['completed'])
    total_games = len(games_data)
    scores = [g['best_score'] for g in games_data if g['best_score'] > 0]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    return Response({
        'area': {
            'id': area.id,
            'name': area.name,
            'description': area.description,
            'completed_games': completed_count,
            'total_games': total_games,
            'average_score': round(avg_score, 1),
            'theme_color': area.theme_color,
            'icon': area.icon
        },
        'games': games_data
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_spelling_questions(request, area_id):
    """Get spelling questions for a specific area"""
    try:
        # Verify area exists
        area = Area.objects.get(id=area_id, is_active=True)
        
        # ✅ Fixed: Use 'spelling_data' instead of 'spellingitem'
        items = GameItem.objects.filter(
            area=area,
            game__game_type='spelling-challenge'
        ).select_related('spelling_data')
        
        questions = []
        for item in items:
            # ✅ Fixed: Check for 'spelling_data' attribute
            if hasattr(item, 'spelling_data'):
                questions.append({
                    'id': item.id,
                    'word': item.spelling_data.word,
                    'sentence': item.spelling_data.sentence,
                    'difficulty': item.get_difficulty_display(),
                })
        
        print(f"✅ Found {len(questions)} spelling questions for area {area_id}")
        
        return Response({
            'questions': questions,
            'area': {
                'id': area.id,
                'name': area.name
            }
        })
    except Area.DoesNotExist:
        return Response({'error': 'Area not found'}, status=404)
    except Exception as e:
        print(f"❌ Error fetching spelling questions: {str(e)}")
        import traceback
        traceback.print_exc()  # This will show the full error in console
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_emoji_questions(request, area_id):
    """Get emoji questions for a specific area"""
    try:
        area = Area.objects.get(id=area_id, is_active=True)
        
        items = GameItem.objects.filter(
            area=area,
            game__game_type='emoji-challenge'
        ).select_related('emoji_data').prefetch_related('emoji_data__emojis')
        
        questions = []
        for item in items:
            if hasattr(item, 'emoji_data'):
                emojis = [
                    {
                        'symbol': emoji.symbol,
                        'keyword': emoji.keyword
                    }
                    for emoji in item.emoji_data.emojis.all()
                ]
                questions.append({
                    'id': item.id,
                    'emojis': emojis,
                    'translation': item.emoji_data.translation,
                    'difficulty': item.get_difficulty_display(),
                })
        
        return Response({'questions': questions})
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_parts_of_speech_questions(request, area_id):
    """Get parts of speech questions for a specific area"""
    try:
        area = Area.objects.get(id=area_id, is_active=True)
        
        items = GameItem.objects.filter(
            area=area,
            game__game_type='parts-of-speech'
        ).select_related('pos_data').prefetch_related('pos_data__words')
        
        questions = []
        for item in items:
            if hasattr(item, 'pos_data'):
                words = [
                    {
                        'word': word.word,
                        'correct_answer': word.correct_answer
                    }
                    for word in item.pos_data.words.all()
                ]
                
                for word_data in words:
                    questions.append({
                        'id': f"{item.id}-{word_data['word']}",
                        'sentence': item.pos_data.sentence,
                        'word': word_data['word'],
                        'correctAnswer': word_data['correct_answer'],
                        'hint': item.pos_data.hint,
                        'explanation': item.pos_data.explanation,
                        'difficulty': item.get_difficulty_display(),
                    })
        
        return Response({'questions': questions})
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_punctuation_questions(request, area_id):
    """Get punctuation questions for a specific area"""
    try:
        area = Area.objects.get(id=area_id, is_active=True)
        
        items = GameItem.objects.filter(
            area=area,
            game__game_type='punctuation-task'
        ).select_related('punctuation_data').prefetch_related('punctuation_data__answers')
        
        questions = []
        for item in items:
            if hasattr(item, 'punctuation_data'):
                answers = [
                    {
                        'position': answer.position,
                        'mark': answer.mark
                    }
                    for answer in item.punctuation_data.answers.all()
                ]
                questions.append({
                    'id': item.id,
                    'sentence': item.punctuation_data.sentence,
                    'answers': answers,
                    'hint': item.punctuation_data.hint,
                    'difficulty': item.get_difficulty_display(),
                })
        
        return Response({'questions': questions})
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_word_association_questions(request, area_id):
    """Get word association questions for a specific area"""
    try:
        area = Area.objects.get(id=area_id, is_active=True)
        
        items = GameItem.objects.filter(
            area=area,
            game__game_type='word-association'
        ).select_related('fourpics_data').prefetch_related('fourpics_data__images')
        
        questions = []
        for item in items:
            if hasattr(item, 'fourpics_data'):
                images = [
                    img.image_path
                    for img in item.fourpics_data.images.all()
                ]
                questions.append({
                    'id': item.id,
                    'answer': item.fourpics_data.answer,
                    'images': images,
                    'hint': item.fourpics_data.hint,
                    'difficulty': item.get_difficulty_display(),
                })
        
        return Response({'questions': questions})
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return Response({'error': str(e)}, status=500)