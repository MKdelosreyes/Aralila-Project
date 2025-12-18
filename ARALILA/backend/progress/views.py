from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Avg, Sum, Count, F, Max
from django.db.models.functions import ExtractHour, ExtractWeekDay
from datetime import datetime, timedelta

from .models import GameProgress
from games.models import Game, Area
from .serializers import LeaderboardEntrySerializer, progress_to_entry


@api_view(["GET"])
@permission_classes([AllowAny])
def leaderboard_view(request):
    """Return top players for a given game and difficulty."""
    game_id = request.query_params.get("game_id")
    game_type = request.query_params.get("game_type")
    area_id = request.query_params.get("area_id")
    difficulty = request.query_params.get("difficulty", "1")
    limit = int(request.query_params.get("limit", "10"))

    if not game_id and not game_type:
        return Response(
            {"error": "game_id or game_type query parameter is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        difficulty = int(difficulty)
        if difficulty not in (1, 2, 3):
            raise ValueError()
    except ValueError:
        return Response(
            {"error": "difficulty must be 1, 2, or 3"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    score_field = f"difficulty_{difficulty}_score"
    time_field = f"difficulty_{difficulty}_time_taken"

    base_q = Q()
    if area_id:
        base_q &= Q(area_id=area_id)
    if game_id:
        base_q &= Q(game_id=game_id)
    elif game_type:
        base_q &= (Q(game__name__iexact=game_type) | Q(game__game_type__iexact=game_type))

    qs = GameProgress.objects.filter(base_q).order_by(f"-{score_field}", time_field)
    qs_nonzero = qs.exclude(**{f"{score_field}": 0})

    entries = []
    for prog in qs_nonzero[:limit]:
        entries.append(progress_to_entry(prog, difficulty))

    serializer = LeaderboardEntrySerializer(entries, many=True)
    return Response({"results": serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_skill_mastery(request):
    """Calculate skill mastery percentages across all games"""
    user = request.user
    
    skill_mapping = {
        'spelling-challenge': 'spelling',
        'punctuation-task': 'punctuation',
        'grammar-check': 'grammar',
        'parts-of-speech': 'grammar',
        'word-association': 'vocabulary',
        'emoji-challenge': 'sentenceConstruction',
    }
    
    mastery = {
        'spelling': 0,
        'punctuation': 0,
        'grammar': 0,
        'vocabulary': 0,
        'sentenceConstruction': 0,
    }
    
    skill_counts = {key: 0 for key in mastery.keys()}
    
    for game_type, skill in skill_mapping.items():
        progress_records = GameProgress.objects.filter(
            user=user,
            game__game_type=game_type
        )
        
        if progress_records.exists():
            # Calculate average across all difficulties
            total_score = 0
            count = 0
            
            for prog in progress_records:
                scores = [
                    prog.difficulty_1_score,
                    prog.difficulty_2_score,
                    prog.difficulty_3_score
                ]
                avg_score = sum(scores) / 3 if any(scores) else 0
                total_score += avg_score
                count += 1
            
            if count > 0:
                mastery[skill] += total_score / count
                skill_counts[skill] += 1
    
    # Average out skills that have multiple games
    for skill, count in skill_counts.items():
        if count > 0:
            mastery[skill] = round(mastery[skill] / count, 1)
    
    return Response({'mastery': mastery})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_improvement_trends(request):
    """Get score improvement trends over time"""
    game_id = request.query_params.get('game_id')
    
    if game_id:
        # Specific game trends
        attempts = GameProgress.objects.filter(
            user=request.user,
            game_id=game_id
        ).order_by('created_at').values(
            'created_at',
            'difficulty_1_score',
            'difficulty_2_score',
            'difficulty_3_score'
        )
        
        trend_data = []
        for attempt in attempts:
            trend_data.append({
                'date': attempt['created_at'].strftime('%Y-%m-%d'),
                'easy': attempt['difficulty_1_score'],
                'medium': attempt['difficulty_2_score'],
                'hard': attempt['difficulty_3_score'],
            })
    else:
        # Overall trends (all games)
        attempts = GameProgress.objects.filter(
            user=request.user
        ).order_by('created_at')
        
        trend_data = []
        for attempt in attempts:
            best_score = max(
                attempt.difficulty_1_score,
                attempt.difficulty_2_score,
                attempt.difficulty_3_score
            )
            trend_data.append({
                'date': attempt.created_at.strftime('%Y-%m-%d'),
                'score': best_score,
                'game': attempt.game.name
            })
    
    return Response({'trends': trend_data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_personalized_insights(request):
    """Generate personalized learning insights"""
    progress = GameProgress.objects.filter(user=request.user)
    
    insights = []
    
    # Find weakest skill
    weakest_game = progress.order_by('difficulty_1_score').first()
    if weakest_game and weakest_game.difficulty_1_score < 60:
        insights.append({
            'type': 'improvement',
            'icon': '📈',
            'message': f"Magpraktis pa sa {weakest_game.game.name} upang mapabuti ang iyong kasanayan!",
            'message_en': f"Practice more {weakest_game.game.name} to improve your skills!",
            'action': f"/student/challenges/games/{weakest_game.game.game_type}",
            'game_type': weakest_game.game.game_type
        })
    
    # Suggest next difficulty
    ready_for_upgrade = progress.filter(
        difficulty_1_completed=True,
        difficulty_2_unlocked=True,
        difficulty_2_score=0
    ).first()
    
    if ready_for_upgrade:
        insights.append({
            'type': 'challenge',
            'icon': '🎯',
            'message': f"Handa ka na para sa Medium difficulty sa {ready_for_upgrade.game.name}!",
            'message_en': f"Ready to try Medium difficulty in {ready_for_upgrade.game.name}?",
            'action': f"/student/challenges/games/{ready_for_upgrade.game.game_type}",
            'game_type': ready_for_upgrade.game.game_type
        })
    
    # Streak motivation
    user = request.user
    if hasattr(user, 'login_streak') and user.login_streak >= 3:
        insights.append({
            'type': 'celebration',
            'icon': '🔥',
            'message': f"Ang galing! {user.login_streak} araw na sunod-sunod na pag-aaral!",
            'message_en': f"Amazing! You're on a {user.login_streak}-day streak!",
        })
    
    # Find games with low attempts
    low_practice = progress.filter(attempts__lt=3, stars_earned__lt=2).order_by('attempts').first()
    if low_practice:
        insights.append({
            'type': 'practice',
            'icon': '💪',
            'message': f"Subukan ulit ang {low_practice.game.name} para makakuha ng mas mataas na score!",
            'message_en': f"Try {low_practice.game.name} again to get a higher score!",
            'action': f"/student/challenges/games/{low_practice.game.game_type}",
            'game_type': low_practice.game.game_type
        })
    
    # Congratulate high performers
    perfect_games = progress.filter(stars_earned=3).count()
    if perfect_games >= 5:
        insights.append({
            'type': 'achievement',
            'icon': '🏆',
            'message': f"Nakumpleto mo na ang {perfect_games} laro nang perpekto! Ikaw ay napakagaling!",
            'message_en': f"You've mastered {perfect_games} games! You're doing amazing!",
        })
    
    return Response({'insights': insights[:4]})  # Limit to 4 insights


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_time_analytics(request):
    """Analyze playing patterns by time"""
    from django.db.models.functions import ExtractHour, ExtractWeekDay
    
    # Most active time of day
    hourly_activity = GameProgress.objects.filter(
        user=request.user
    ).annotate(
        hour=ExtractHour('last_played')
    ).values('hour').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Most active day of week
    daily_activity = GameProgress.objects.filter(
        user=request.user
    ).annotate(
        weekday=ExtractWeekDay('last_played')
    ).values('weekday').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Total time spent
    total_time = GameProgress.objects.filter(
        user=request.user
    ).aggregate(
        total=Sum(F('difficulty_1_time_taken') + F('difficulty_2_time_taken') + F('difficulty_3_time_taken'))
    )['total'] or 0
    
    # Recent activity (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    recent_sessions = GameProgress.objects.filter(
        user=request.user,
        last_played__gte=week_ago
    ).count()
    
    weekday_names = ['', 'Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado']
    
    return Response({
        'peak_hour': hourly_activity.first()['hour'] if hourly_activity else None,
        'most_active_day': weekday_names[daily_activity.first()['weekday']] if daily_activity else None,
        'total_sessions': GameProgress.objects.filter(user=request.user).count(),
        'total_time_minutes': round(total_time / 60, 1) if total_time else 0,
        'recent_sessions': recent_sessions,
        'activity_by_day': [
            {
                'day': weekday_names[item['weekday']],
                'count': item['count']
            }
            for item in daily_activity[:7]
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics_dashboard(request):
    """Combine all analytics in one response"""
    try:
        user = request.user

        # user.update_streak()
        progress = GameProgress.objects.filter(user=user)
        
        # Overall stats
        total_games_played = progress.count()
        total_stars = progress.aggregate(total=Sum('stars_earned'))['total'] or 0
        areas_unlocked = Area.objects.filter(
            id__in=progress.values_list('area_id', flat=True).distinct()
        ).count()
        
        # Average scores by difficulty
        avg_easy = progress.aggregate(avg=Avg('difficulty_1_score'))['avg'] or 0
        avg_medium = progress.aggregate(avg=Avg('difficulty_2_score'))['avg'] or 0
        avg_hard = progress.aggregate(avg=Avg('difficulty_3_score'))['avg'] or 0
        
        # Best improvements
        improvements = []
        for prog in progress.all():
            if prog.attempts > 1:
                best_score = max(prog.difficulty_1_score, prog.difficulty_2_score, prog.difficulty_3_score)
                first_score = prog.difficulty_1_score if prog.difficulty_1_score > 0 else 0
                
                if first_score > 0 and best_score > first_score:
                    improvement_pct = ((best_score - first_score) / first_score) * 100
                    improvements.append({
                        'game_id': prog.game.id,
                        'game_name': prog.game.name,
                        'first_attempt': first_score,
                        'best_score': best_score,
                        'improvement_percentage': round(improvement_pct, 1)
                    })
        
        improvements.sort(key=lambda x: x['improvement_percentage'], reverse=True)
        
        # Skill Mastery calculation (inline)
        skill_mapping = {
            'spelling-challenge': 'spelling',
            'punctuation-task': 'punctuation',
            'grammar-check': 'grammar',
            'parts-of-speech': 'grammar',
            'word-association': 'vocabulary',
            'emoji-challenge': 'sentenceConstruction',
        }
        
        mastery = {
            'spelling': 0,
            'punctuation': 0,
            'grammar': 0,
            'vocabulary': 0,
            'sentenceConstruction': 0,
        }
        
        skill_counts = {key: 0 for key in mastery.keys()}
        
        for game_type, skill in skill_mapping.items():
            progress_records = GameProgress.objects.filter(
                user=user,
                game__game_type=game_type
            )
            
            if progress_records.exists():
                total_score = 0
                count = 0
                
                for prog in progress_records:
                    scores = [
                        prog.difficulty_1_score,
                        prog.difficulty_2_score,
                        prog.difficulty_3_score
                    ]
                    avg_score = sum(scores) / 3 if any(scores) else 0
                    total_score += avg_score
                    count += 1
                
                if count > 0:
                    mastery[skill] += total_score / count
                    skill_counts[skill] += 1
        
        for skill, count in skill_counts.items():
            if count > 0:
                mastery[skill] = round(mastery[skill] / count, 1)
        
        # Insights calculation (inline)
        insights = []
        
        weakest_game = progress.order_by('difficulty_1_score').first()
        if weakest_game and weakest_game.difficulty_1_score < 60:
            insights.append({
                'type': 'improvement',
                'icon': '📈',
                'message': f"Magpraktis pa sa {weakest_game.game.name} upang mapabuti ang iyong kasanayan!",
                'message_en': f"Practice more {weakest_game.game.name} to improve your skills!",
                'action': f"/student/challenges/games/{weakest_game.game.game_type}",
                'game_type': weakest_game.game.game_type
            })
        
        ready_for_upgrade = progress.filter(
            difficulty_1_completed=True,
            difficulty_2_unlocked=True,
            difficulty_2_score=0
        ).first()
        
        if ready_for_upgrade:
            insights.append({
                'type': 'challenge',
                'icon': '🎯',
                'message': f"Handa ka na para sa Medium difficulty sa {ready_for_upgrade.game.name}!",
                'message_en': f"Ready to try Medium difficulty in {ready_for_upgrade.game.name}?",
                'action': f"/student/challenges/games/{ready_for_upgrade.game.game_type}",
                'game_type': ready_for_upgrade.game.game_type
            })
        
        if hasattr(user, 'login_streak') and user.login_streak >= 3:
            insights.append({
                'type': 'celebration',
                'icon': '🔥',
                'message': f"Ang galing! {user.login_streak} araw na sunod-sunod na pag-aaral!",
                'message_en': f"Amazing! You're on a {user.login_streak}-day streak!",
            })
        
        low_practice = progress.filter(attempts__lt=3, stars_earned__lt=2).order_by('attempts').first()
        if low_practice:
            insights.append({
                'type': 'practice',
                'icon': '💪',
                'message': f"Subukan ulit ang {low_practice.game.name} para makakuha ng mas mataas na score!",
                'message_en': f"Try {low_practice.game.name} again to get a higher score!",
                'action': f"/student/challenges/games/{low_practice.game.game_type}",
                'game_type': low_practice.game.game_type
            })
        
        perfect_games = progress.filter(stars_earned=3).count()
        if perfect_games >= 5:
            insights.append({
                'type': 'achievement',
                'icon': '🏆',
                'message': f"Nakumpleto mo na ang {perfect_games} laro nang perpekto! Ikaw ay napakagaling!",
                'message_en': f"You've mastered {perfect_games} games! You're doing amazing!",
            })
        
        # Time Analytics calculation (inline)
        hourly_activity = GameProgress.objects.filter(
            user=user
        ).annotate(
            hour=ExtractHour('last_played')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('-count')
        
        daily_activity = GameProgress.objects.filter(
            user=user
        ).annotate(
            weekday=ExtractWeekDay('last_played')
        ).values('weekday').annotate(
            count=Count('id')
        ).order_by('-count')
        
        total_time = GameProgress.objects.filter(
            user=user
        ).aggregate(
            total=Sum(F('difficulty_1_time_taken') + F('difficulty_2_time_taken') + F('difficulty_3_time_taken'))
        )['total'] or 0
        
        week_ago = datetime.now() - timedelta(days=7)
        recent_sessions = GameProgress.objects.filter(
            user=user,
            last_played__gte=week_ago
        ).count()
        
        weekday_names = ['', 'Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado']
        
        time_analytics = {
            'peak_hour': hourly_activity.first()['hour'] if hourly_activity.exists() else None,
            'most_active_day': weekday_names[daily_activity.first()['weekday']] if daily_activity.exists() else None,
            'total_sessions': GameProgress.objects.filter(user=user).count(),
            'total_time_minutes': round(total_time / 60, 1) if total_time else 0,
            'recent_sessions': recent_sessions,
            'activity_by_day': [
                {
                    'day': weekday_names[item['weekday']],
                    'count': item['count']
                }
                for item in daily_activity[:7]
            ]
        }
        
        return Response({
            'overview': {
                'totalGamesPlayed': total_games_played,
                'totalStarsEarned': total_stars,
                'areasUnlocked': areas_unlocked,
                'currentStreak': user.login_streak,
                'longestStreak': user.longest_streak,
            },
            'averageScoreByDifficulty': {
                'easy': round(avg_easy, 1),
                'medium': round(avg_medium, 1),
                'hard': round(avg_hard, 1),
            },
            'scoreImprovement': improvements[:5],
            'skillMastery': mastery,
            'insights': insights[:4],
            'timeAnalytics': time_analytics,
        })
    
    except Exception as e:
        import traceback
        print(f"Error in analytics dashboard: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {'error': f'Failed to generate analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

