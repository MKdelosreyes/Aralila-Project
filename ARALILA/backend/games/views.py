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
from progress.models import GameProgress

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
    all_areas = Area.objects.filter(is_active=True).order_by('order_index')
    areas_data = []
    
    for index, area in enumerate(all_areas):
        # Get all games for this area
        game_items = GameItem.objects.filter(area=area).select_related('game')
        total_games = game_items.count()
        
        if total_games == 0:
            total_games = 6
        
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
        
        is_locked = False
        message = ""
        
        if index == 0:
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
            
            if prev_total == 0:
                prev_total = 6
            
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
            'id': area.id,  # Database ID (for reference)
            'order_index': area.order_index, 
            'name': area.name,
            'description': area.description,
            'is_locked': is_locked,
            'completed_games': completed_games,
            'total_games': total_games,
            'average_score': round(average_score, 1),
            'message': message,
            'theme_color': area.theme_color,
        })
    
    return Response({'areas': areas_data})


PASS_THRESHOLDS = {1: 60, 2: 70, 3: 80}
SKIP_THRESHOLD = 90  # Score needed to unlock skip


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_game_questions_by_difficulty(request, area_id, game_type, difficulty):
    """
    Get questions for a specific game type, area, and difficulty level
    Implements hybrid unlock logic with skip mechanic
    """
    try:
        area = Area.objects.get(id=area_id, is_active=True)
        game = Game.objects.get(game_type=game_type)
        
        # Get or create progress
        progress, created = GameProgress.objects.get_or_create(
            user=request.user,
            area=area,
            game=game
        )
        
        # Check access permission
        if not progress.can_access_difficulty(difficulty):
            return Response({
                'error': f'Kailangan mong kumpletuhin ang Difficulty {difficulty - 1} muna!',
                'locked': True,
                'required_difficulty': difficulty - 1
            }, status=403)
        
        items = GameItem.objects.filter(
            area=area,
            game=game,
            difficulty=difficulty
        ).order_by('id') 
        
        if not items.exists():
            return Response({
                'error': 'No questions available for this difficulty',
                'questions': [],
                'difficulty': difficulty
            }, status=200)
        
        questions = []
        
        # Route to appropriate handler based on game_type
        if game_type == 'spelling-challenge':
            for item in items:
                try:
                    spelling = item.spelling_data
                    questions.append({
                        'id': item.id,
                        'word': spelling.word,
                        'sentence': spelling.sentence,
                    })
                except Exception as e:
                    print(f"Error loading spelling item {item.id}: {e}")
                    continue
        
        elif game_type == 'emoji-challenge':
            for item in items:
                try:
                    emoji = item.emoji_data
                    symbols = list(emoji.symbols.values('symbol', 'keyword'))
                    questions.append({
                        'id': item.id,
                        'translation': emoji.translation,
                        'symbols': symbols,
                    })
                except Exception as e:
                    print(f"Error loading emoji item {item.id}: {e}")
                    continue
        
        elif game_type == 'punctuation-task':
            for item in items:
                try:
                    punctuation = item.punctuation_data
                    answers = list(punctuation.answers.values('position', 'mark'))
                    questions.append({
                        'id': item.id,
                        'sentence': punctuation.sentence,
                        'hint': punctuation.hint,
                        'answers': answers
                    })
                except Exception as e:
                    print(f"Error loading punctuation item {item.id}: {e}")
                    continue
        
        elif game_type == 'parts-of-speech':
            for item in items:
                try:
                    pos = item.pos_data
                    words = []
                    for word_obj in pos.words.all():
                        words.append({
                            'id': word_obj.id,
                            'word': word_obj.word,
                            'correct_answer': word_obj.correct_answer
                        })
                    questions.append({
                        'id': item.id,
                        'sentence': pos.sentence,
                        'words': words,
                        'hint': pos.hint,
                        'explanation': pos.explanation
                    })
                except Exception as e:
                    print(f"Error loading POS item {item.id}: {e}")
                    continue
        
        elif game_type == 'word-association':
            for item in items:
                try:
                    fourpics = item.fourpics_data
                    images = [img.image_path for img in fourpics.images.all()]
                    questions.append({
                        'id': item.id,
                        'answer': fourpics.answer,
                        'images': images,
                        'hint': fourpics.hint
                    })
                except Exception as e:
                    print(f"Error loading word association item {item.id}: {e}")
                    continue
        
        # Determine skip/replay status
        skip_message = None
        replay_mode = progress.stars_earned == 3
        
        if replay_mode:
            skip_message = "Replay Mode: Kumpleto na ang lahat ng difficulty!"
        elif difficulty == 2 and progress.difficulty_2_unlocked and not progress.difficulty_1_completed:
            skip_message = "Nag-skip ka sa Medium dahil sa perfect score sa Easy!"
        elif difficulty == 3 and progress.difficulty_3_unlocked and not progress.difficulty_2_completed:
            skip_message = "Nag-skip ka sa Hard dahil sa perfect score sa Medium!"
        
        return Response({
            'questions': questions,
            'difficulty': difficulty,
            'difficulty_label': {1: 'Easy', 2: 'Medium', 3: 'Hard'}[difficulty],
            'pass_threshold': PASS_THRESHOLDS[difficulty],
            'area': {'id': area.id, 'name': area.name},
            'game': {'id': game.id, 'name': game.name, 'type': game_type},
            'total_questions': len(questions),
            'skip_message': skip_message,
            'replay_mode': replay_mode,
            'stars_earned': progress.stars_earned,
        })
        
    except Area.DoesNotExist:
        return Response({'error': 'Area not found'}, status=404)
    except Game.DoesNotExist:
        return Response({'error': 'Game not found'}, status=404)
    except Exception as e:
        import traceback
        print(f"Error in get_game_questions_by_difficulty: {str(e)}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_game_score(request):
    """
    Submit score and update star progress with hybrid unlock logic
    """
    try:
        area_id = request.data.get('area_id')
        game_type = request.data.get('game_type')
        difficulty = request.data.get('difficulty')
        score = request.data.get('score')
        
        # Validation
        if not all([area_id, game_type, difficulty is not None, score is not None]):
            return Response({'error': 'Missing required fields'}, status=400)
        
        area = Area.objects.get(id=area_id)
        game = Game.objects.get(game_type=game_type)
        
        # Get or create progress
        progress, created = GameProgress.objects.get_or_create(
            user=request.user,
            area=area,
            game=game
        )
        
        progress.attempts += 1
        
        # Check if passed
        passed = score >= PASS_THRESHOLDS[difficulty]
        can_skip = score >= SKIP_THRESHOLD and difficulty < 3
        
        # Update difficulty-specific scores
        unlocked_message = None
        next_unlocked_difficulty = None
        
        if difficulty == 1:
            if score > progress.difficulty_1_score:
                progress.difficulty_1_score = score
            if passed:
                progress.difficulty_1_completed = True
                progress.difficulty_2_unlocked = True  # Normal unlock
                next_unlocked_difficulty = 2
                
                if can_skip:
                    # Skip mechanic: unlock hard mode too!
                    progress.difficulty_3_unlocked = True
                    unlocked_message = "🎯 Excellent! Medium AND Hard difficulties unlocked!"
                    next_unlocked_difficulty = 3  # Can skip to hard
                else:
                    unlocked_message = "✅ Medium difficulty unlocked!"
        
        elif difficulty == 2:
            if score > progress.difficulty_2_score:
                progress.difficulty_2_score = score
            if passed:
                progress.difficulty_2_completed = True
                progress.difficulty_3_unlocked = True  # Normal unlock
                next_unlocked_difficulty = 3
                
                if can_skip:
                    unlocked_message = "🎯 Amazing! Hard difficulty unlocked with a perfect score!"
                else:
                    unlocked_message = "✅ Hard difficulty unlocked!"
        
        elif difficulty == 3:
            if score > progress.difficulty_3_score:
                progress.difficulty_3_score = score
            if passed:
                progress.difficulty_3_completed = True
                unlocked_message = "🏆 Congratulations! You've mastered this game!"
        
        # Update overall best score
        progress.score = max(
            progress.difficulty_1_score,
            progress.difficulty_2_score,
            progress.difficulty_3_score
        )
        
        # Update stars
        progress.update_stars()
        
        # Check if all difficulties completed
        progress.completed = progress.difficulty_3_completed
        
        progress.save()
        
        return Response({
            'success': True,
            'passed': passed,
            'score': score,
            'stars_earned': progress.stars_earned,
            'next_difficulty': next_unlocked_difficulty,
            'unlocked_message': unlocked_message,
            'can_skip': can_skip,
            'replay_mode': progress.stars_earned == 3,
            'difficulty_scores': {
                1: progress.difficulty_1_score,
                2: progress.difficulty_2_score,
                3: progress.difficulty_3_score,
            },
            'difficulty_unlocked': {
                1: True,  # Always unlocked
                2: progress.difficulty_2_unlocked,
                3: progress.difficulty_3_unlocked,
            }
        })
        
    except Area.DoesNotExist:
        return Response({'error': 'Area not found'}, status=404)
    except Game.DoesNotExist:
        return Response({'error': 'Game not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_area_detail(request, area_id):
    """Get detailed information about a specific area and its games with star progress"""
    
    try:
        area = Area.objects.get(id=area_id, is_active=True)
    except Area.DoesNotExist:
        return Response({'error': 'Area not found'}, status=404)
    
    game_ids = GameItem.objects.filter(area=area).values_list('game_id', flat=True).distinct()
    games_in_area = Game.objects.filter(id__in=game_ids).order_by('order_index')
    
    games_data = []
    for game in games_in_area:
        
        progress = GameProgress.objects.filter(
            user=request.user,
            area=area,
            game=game
        ).first()
        
        attempts = GameProgress.objects.filter(
            user=request.user,
            area=area,
            game=game
        ).count()
        
        game_type = game.game_type if game.game_type else 'unknown'
        
        if progress:
            if not progress.difficulty_1_completed:
                next_difficulty = 1
            elif progress.difficulty_3_unlocked and not progress.difficulty_3_completed:
                next_difficulty = 3
            elif not progress.difficulty_2_completed:
                next_difficulty = 2
            elif not progress.difficulty_3_completed:
                next_difficulty = 3
            else:
                next_difficulty = 1
            
            games_data.append({
                'id': game.id,
                'name': game.name,
                'description': game.description,
                'game_type': game_type,
                'stars_earned': progress.stars_earned,
                'next_difficulty': next_difficulty,
                'difficulty_scores': {
                    1: progress.difficulty_1_score,
                    2: progress.difficulty_2_score,
                    3: progress.difficulty_3_score,
                },
                'difficulty_unlocked': {
                    1: True,
                    2: progress.difficulty_2_unlocked,
                    3: progress.difficulty_3_unlocked,
                },
                'best_score': progress.score,
                'completed': progress.completed,
                'attempts': attempts,
                'replay_mode': progress.stars_earned == 3,
            })
        else:
            games_data.append({
                'id': game.id,
                'name': game.name,
                'description': game.description,
                'game_type': game_type,
                'stars_earned': 0,
                'next_difficulty': 1,
                'difficulty_scores': {1: 0, 2: 0, 3: 0},
                'difficulty_unlocked': {1: True, 2: False, 3: False},
                'best_score': 0,
                'completed': False,
                'attempts': 0,
                'replay_mode': False,
            })
    
    completed_count = sum(1 for g in games_data if g['completed'])
    total_games = len(games_data)
    
    # ✅ Handle empty games
    if total_games == 0:
        total_games = 6
    
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
        },
        'games': games_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_area_by_order(request, order_index):
    """
    Get area details by order_index instead of id
    This makes the system independent of database IDs
    """
    try:
        area = Area.objects.get(order_index=order_index, is_active=True)
        
        game_ids = GameItem.objects.filter(area=area).values_list('game_id', flat=True).distinct()
        
        # Then get the Game objects
        games_in_area = Game.objects.filter(id__in=game_ids).order_by('order_index')
        
        games_data = []
        for game in games_in_area:
            
            progress = GameProgress.objects.filter(
                user=request.user,
                area=area,
                game=game
            ).first()
            
            attempts = GameProgress.objects.filter(
                user=request.user,
                area=area,
                game=game
            ).count()
            
            game_type = game.game_type if game.game_type else 'unknown'
            
            if progress:
                if not progress.difficulty_1_completed:
                    next_difficulty = 1
                elif progress.difficulty_3_unlocked and not progress.difficulty_3_completed:
                    next_difficulty = 3
                elif not progress.difficulty_2_completed:
                    next_difficulty = 2
                elif not progress.difficulty_3_completed:
                    next_difficulty = 3
                else:
                    next_difficulty = 1
                
                games_data.append({
                    'id': game.id,
                    'name': game.name,
                    'description': game.description,
                    'game_type': game_type,
                    'stars_earned': progress.stars_earned,
                    'next_difficulty': next_difficulty,
                    'difficulty_scores': {
                        1: progress.difficulty_1_score,
                        2: progress.difficulty_2_score,
                        3: progress.difficulty_3_score,
                    },
                    'difficulty_unlocked': {
                        1: True,
                        2: progress.difficulty_2_unlocked,
                        3: progress.difficulty_3_unlocked,
                    },
                    'best_score': progress.score,
                    'completed': progress.completed,
                    'attempts': attempts,
                    'replay_mode': progress.stars_earned == 3,
                })
            else:
                games_data.append({
                    'id': game.id,
                    'name': game.name,
                    'description': game.description,
                    'game_type': game_type,
                    'stars_earned': 0,
                    'next_difficulty': 1,
                    'difficulty_scores': {1: 0, 2: 0, 3: 0},
                    'difficulty_unlocked': {1: True, 2: False, 3: False},
                    'best_score': 0,
                    'completed': False,
                    'attempts': 0,
                    'replay_mode': False,
                })
        
        completed_count = sum(1 for g in games_data if g['completed'])
        total_games = len(games_data)
        
        if total_games == 0:
            total_games = 6  # Expected games per area
        
        scores = [g['best_score'] for g in games_data if g['best_score'] > 0]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        return Response({
            'area': {
                'id': area.id,
                'order_index': area.order_index,
                'name': area.name,
                'description': area.description,
                'completed_games': completed_count,
                'total_games': total_games,
                'average_score': round(avg_score, 1),
                'theme_color': area.theme_color,
            },
            'games': games_data
        })
        
    except Area.DoesNotExist:
        return Response(
            {'error': f'Area with order {order_index} not found'}, 
            status=404
        )
    except Exception as e:
        import traceback
        print(f"❌ Error in get_area_by_order: {str(e)}")
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_spelling_questions(request, area_id):
    """Get spelling questions for a specific area"""
    try:
        # Verify area exists
        area = Area.objects.get(id=area_id, is_active=True)
        
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
    

