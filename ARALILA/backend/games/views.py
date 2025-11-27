from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Max, Count, Q
from .models import Area, Game, GameItem, AssessmentLesson, AssessmentChallenge, AssessmentProgress
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
    try:
        data = json.loads(request.body)
        student_answer = data.get("answer", "")
        emojis = data.get("emojis", [])

        prompt = f"""You are a Filipino language teacher. Evaluate this student's sentence.

Keywords to use: {emojis}
Student's sentence: "{student_answer}"

Evaluation criteria:
1. Check if ALL words are in Filipino (Tagalog). If English words are used, note them.
2. Check grammar correctness in Filipino.
3. Check if meaning matches the keywords.

Scoring rules:
- All Filipino words + correct grammar + matches keywords = 20 points (valid: true)
- Has 1-2 English words but otherwise correct = 15 points (valid: true)
- Has 3+ English words or major grammar issues = 10 points (valid: false)
- Completely wrong or nonsensical = 0 points (valid: false)

Respond ONLY in valid JSON:
{{
  "valid": true/false,
  "points": 0-20,
  "explanation": "Filipino text explaining what's good/wrong. If English words found, mention them and give Filipino equivalents.",
  "english_words_found": ["word1", "word2"] or [],
  "filipino_equivalents": {{"english_word": "Filipino_word"}} or {{}}
}}

Example response for mixed language:
{{
  "valid": true,
  "points": 15,
  "explanation": "Maganda ang sentence mo pero may English words: 'run' (dapat 'takbo'), 'water' (dapat 'tubig'). Gamitin: 'Tumakbo siya para sa tubig.'",
  "english_words_found": ["run", "water"],
  "filipino_equivalents": {{"run": "takbo", "water": "tubig"}}
}}
"""

        response = client.responses.create(
            model="gpt-4o-mini",  
            input=[
                {"role": "system", "content": "Respond ONLY in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_output_tokens=120,  
        )

        ai_msg = response.output_text.strip()

        cleaned = (
            ai_msg.replace("```json", "")
                  .replace("```", "")
                  .strip()
        )

        result = json.loads(cleaned)
        
        if "points" not in result:
            result["points"] = 20 if result.get("valid") else 0
        if "english_words_found" not in result:
            result["english_words_found"] = []
        if "filipino_equivalents" not in result:
            result["filipino_equivalents"] = {}
            
        return JsonResponse(result)

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON returned by AI."},
            status=500
        )

    except Exception as e:
        if "429" in str(e):
            return JsonResponse(
                {"error": "Rate limit exceeded. Please try again."},
                status=429
            )
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unlocked_areas(request):
    """Get all areas with lock/unlock status and progress for current user"""

    print(f"🔍 request.user type: {type(request.user)}")
    print(f"🔍 request.user value: {request.user}")
    print(f"🔍 request.user.__class__.__name__: {request.user.__class__.__name__}")
    
    from users.models import CustomUser
    current_user = request.user
    
    if not isinstance(current_user, CustomUser):
        print(f"❌ WARNING: request.user is {type(current_user)}, not CustomUser!")
        if hasattr(current_user, 'email'):
            current_user = CustomUser.objects.get(email=current_user.email)
        else:
            return Response({'error': 'Invalid user authentication'}, status=401)
    
    print(f"✅ Using user: {current_user} (ID: {current_user.id})")

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
            user=current_user,
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
            
            # Check practice games progress
            previous_progress = GameProgress.objects.filter(
                user=current_user,
                area=previous_area
            )
            
            # Get total games in previous area
            prev_game_ids = GameItem.objects.filter(area=previous_area).values_list('game_id', flat=True).distinct()
            prev_total = Game.objects.filter(id__in=prev_game_ids).count()
            
            if prev_total == 0:
                prev_total = 6
            
            # Count games with at least 1 star
            prev_games_with_stars = previous_progress.filter(stars_earned__gte=1).count()
            
            # Check if previous area's assessment was passed
            prev_assessment_passed = AssessmentProgress.objects.filter(
                user=current_user,
                area=previous_area,
                passed=True
            ).exists()
            
            # Both conditions must be met
            if prev_games_with_stars < prev_total:
                is_locked = True
                message = f"Earn at least 1 star in all games in {previous_area.name} ({prev_games_with_stars}/{prev_total})"
            elif not prev_assessment_passed:
                is_locked = True
                message = f"Pass the assessment in {previous_area.name} with 80%+"
            else:
                is_locked = False
                message = "Unlocked!"
            
        
        areas_data.append({
            'id': area.id,  
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


UNLOCK_THRESHOLD = 80
PASS_THRESHOLDS = {1: UNLOCK_THRESHOLD, 2: UNLOCK_THRESHOLD, 3: UNLOCK_THRESHOLD}


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
                'error': f'Kailangan mong tapusin muna ang {difficulty - 1 if difficulty>1 else 1} (previous) difficulty.',
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

        elif game_type == 'grammar-check':
            for item in items:
                try:
                    grammar = item.grammar_data
                    questions.append({
                        'id': item.id,
                        'sentence': grammar.sentence,
                    })
                except Exception as e:
                    print(f"Error loading spelling item {item.id}: {e}")
                    continue
        
        elif game_type == 'emoji-challenge':
            for item in items:
                try:
                    emoji = item.emoji_data
                    emoji_list = []
                    for emoji_symbol in emoji.emojis.all():
                        emoji_list.append(emoji_symbol.symbol)
                    
                    keyword_list = []
                    for emoji_symbol in emoji.emojis.all():
                        keyword_list.append(emoji_symbol.keyword)
                    
                    questions.append({
                        'id': item.id,
                        'emojis': emoji_list, 
                        'keywords': keyword_list,  
                        'translation': emoji.translation,
                    })
                except Exception as e:
                    print(f"Error loading emoji item {item.id}: {e}")
                    import traceback
                    traceback.print_exc()
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
        replay_mode = progress.stars_earned == 3
        return Response({
            'questions': questions,
            'difficulty': difficulty,
            'difficulty_label': {1: 'Easy', 2: 'Medium', 3: 'Hard'}[difficulty],
            'pass_threshold': UNLOCK_THRESHOLD,
            'area': {'id': area.id, 'name': area.name},
            'game': {'id': game.id, 'name': game.name, 'type': game_type},
            'total_questions': len(questions),
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
        
        passed = score >= UNLOCK_THRESHOLD
        next_unlocked_difficulty = None
        unlocked_message = None
        
        if difficulty == 1:
            if score > progress.difficulty_1_score:
                progress.difficulty_1_score = score
            if passed and not progress.difficulty_1_completed:
                progress.difficulty_1_completed = True
                unlocked_message = "✅ Medium difficulty unlocked!"
        elif difficulty == 2:
            if score > progress.difficulty_2_score:
                progress.difficulty_2_score = score
            if passed and not progress.difficulty_2_completed:
                progress.difficulty_2_completed = True
                unlocked_message = "✅ Hard difficulty unlocked!"
        elif difficulty == 3:
            if score > progress.difficulty_3_score:
                progress.difficulty_3_score = score
            if passed and not progress.difficulty_3_completed:
                progress.difficulty_3_completed = True
                unlocked_message = "🏆 Mastered! All difficulties completed."
        

        # Update stars & auto-unlocks
        progress.update_stars()

        # Determine next suggested difficulty (first incomplete)
        if not progress.difficulty_1_completed:
            next_unlocked_difficulty = 1
        elif not progress.difficulty_2_completed:
            next_unlocked_difficulty = 2
        elif not progress.difficulty_3_completed:
            next_unlocked_difficulty = 3
        else:
            next_unlocked_difficulty = 1  # cycle back

        # Overall best score (keep legacy)
        progress.score = max(
            progress.difficulty_1_score,
            progress.difficulty_2_score,
            progress.difficulty_3_score
        )
        progress.completed = progress.difficulty_3_completed
        progress.save()
        
        return Response({
            'success': True,
            'passed': passed,
            'score': score,
            'stars_earned': progress.stars_earned,
            'next_difficulty': next_unlocked_difficulty,
            'unlocked_message': unlocked_message,
            'replay_mode': progress.stars_earned == 3,
            'difficulty_scores': {
                1: progress.difficulty_1_score,
                2: progress.difficulty_2_score,
                3: progress.difficulty_3_score,
            },
            'difficulty_unlocked': {
                1: True,
                2: progress.difficulty_1_completed,
                3: progress.difficulty_2_completed,
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
                    2: progress.difficulty_1_completed,
                    3: progress.difficulty_2_completed,
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
def get_grammar_questions(request, area_id):
    """Get grammar questions for a specific area"""
    try:
        # Verify area exists
        area = Area.objects.get(id=area_id, is_active=True)
        
        items = GameItem.objects.filter(
            area=area,
            game__game_type='grammar-check'
        ).select_related('grammar_data')
        
        questions = []
        for item in items:
            if hasattr(item, 'grammar_data'):
                questions.append({
                    'id': item.id,
                    'sentence': item.grammar_data.sentence,
                    'difficulty': item.get_difficulty_display(),
                })

        print(f"✅ Found {len(questions)} grammar questions for area {area_id}")

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
        print(f"❌ Error fetching grammar questions: {str(e)}")
        import traceback
        traceback.print_exc()  
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
    



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assessment_lesson(request, area_id):
    """Get assessment lesson for an area"""
    try:
        area = Area.objects.get(id=area_id)
        
        # Get all practice games for this area
        game_ids = GameItem.objects.filter(area=area).values_list('game_id', flat=True).distinct()
        total_practice_games = Game.objects.filter(id__in=game_ids).count()
        
        if total_practice_games == 0:
            total_practice_games = 6  # Expected number of games per area
        
        # Check if user has at least 1 star in ALL practice games
        practice_progress = GameProgress.objects.filter(
            user=request.user,
            area=area
        )
        
        # Count games with at least 1 star
        games_with_stars = practice_progress.filter(stars_earned__gte=1).count()
        
        # Check if all games have at least 1 star
        if games_with_stars < total_practice_games:
            return Response({
                'error': 'You must earn at least 1 star in all practice games before taking the assessment',
                'games_with_stars': games_with_stars,
                'total_games': total_practice_games,
                'missing_stars': total_practice_games - games_with_stars
            }, status=403)
        
        # Get or create assessment lesson
        lesson, _ = AssessmentLesson.objects.get_or_create(area=area)
        
        # Get challenges with options
        challenges = AssessmentChallenge.objects.filter(
            lesson=lesson
        ).prefetch_related('options')
        
        # Check which challenges user has completed
        user_completed = set(
            AssessmentProgress.objects.filter(
                user=request.user,
                area=area,
                completed=True
            ).values_list('challenge_id', flat=True)
        )
        
        challenges_data = []
        for challenge in challenges:
            challenges_data.append({
                'id': challenge.id,
                'type': challenge.type,
                'question': challenge.question,
                'order': challenge.order_index,
                'completed': challenge.id in user_completed,
                'challengeOptions': [
                    {
                        'id': opt.id,
                        'text': opt.text,
                        'correct': opt.correct,
                        'imageSrc': opt.image_src or None,
                        'audioSrc': opt.audio_src or None
                    } for opt in challenge.options.all()
                ]
            })
        
        return Response({
            'id': lesson.id,
            'title': lesson.title,
            'challenges': challenges_data
        })
        
    except Area.DoesNotExist:
        return Response({'error': 'Area not found'}, status=404)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assessment_challenge(request):
    """Mark challenge as completed and award points"""
    try:
        challenge_id = request.data.get('challengeId')
        
        challenge = AssessmentChallenge.objects.get(id=challenge_id)
        
        # Mark as completed
        progress, created = AssessmentProgress.objects.update_or_create(
            user=request.user,
            area=challenge.lesson.area,
            challenge=challenge,
            defaults={'completed': True}
        )
        
        return Response({
            'success': True,
            'points': 10  # Award 10 points per challenge
        })
        
    except AssessmentChallenge.DoesNotExist:
        return Response({'error': 'Challenge not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_assessment(request):
    """Complete assessment and unlock next area"""
    try:
        area_id = request.data.get('areaId')
        percentage = request.data.get('percentage')
        
        area = Area.objects.get(id=area_id)
        
        # Double-check that user has at least 1 star in all practice games
        game_ids = GameItem.objects.filter(area=area).values_list('game_id', flat=True).distinct()
        total_practice_games = Game.objects.filter(id__in=game_ids).count()
        
        if total_practice_games == 0:
            total_practice_games = 6
        
        games_with_stars = GameProgress.objects.filter(
            user=request.user,
            area=area,
            stars_earned__gte=1
        ).count()
        
        if games_with_stars < total_practice_games:
            return Response({
                'error': 'You must have at least 1 star in all practice games',
                'games_with_stars': games_with_stars,
                'total_games': total_practice_games
            }, status=403)
        
        # Check if passed assessment (80% required)
        passed = percentage >= 80
        
        if passed:
            # Mark area assessment as passed
            lesson = AssessmentLesson.objects.get(area=area)
            
            # Update or create assessment completion record
            from django.db.models import Q
            AssessmentProgress.objects.filter(
                user=request.user,
                area=area,
                challenge__lesson=lesson
            ).update(passed=True)
            
            # Get next area
            next_area = Area.objects.filter(
                order_index=area.order_index + 1,
                is_active=True
            ).first()
            
            return Response({
                'success': True,
                'passed': True,
                'percentage': percentage,
                'nextArea': {
                    'id': next_area.id,
                    'name': next_area.name,
                    'order_index': next_area.order_index
                } if next_area else None
            })
        else:
            return Response({
                'success': True,
                'passed': False,
                'percentage': percentage,
                'message': 'You need 80% to unlock the next area. Try again!'
            })
            
    except Area.DoesNotExist:
        return Response({'error': 'Area not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)