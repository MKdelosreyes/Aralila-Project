from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import GameProgress
from .serializers import LeaderboardEntrySerializer, progress_to_entry
from django.db.models import Q


@api_view(["GET"])
@permission_classes([AllowAny])
def leaderboard_view(request):
	"""Return top players for a given game and difficulty.

	Query params:
	  - game_id (required): integer ID of Game
	  - difficulty (optional): 1|2|3 (default 1)
	  - limit (optional): number of results (default 10)
	"""
	game_id = request.query_params.get("game_id")
	game_type = request.query_params.get("game_type")
	area_id = request.query_params.get("area_id")
	difficulty = request.query_params.get("difficulty", "1")
	limit = int(request.query_params.get("limit", "10"))

	if not game_id and not game_type:
		return Response({"error": "game_id or game_type query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

	try:
		difficulty = int(difficulty)
		if difficulty not in (1, 2, 3):
			raise ValueError()
	except ValueError:
		return Response({"error": "difficulty must be 1, 2, or 3"}, status=status.HTTP_400_BAD_REQUEST)

	score_field = f"difficulty_{difficulty}_score"

	# Build a combined filter so provided parameters are all respected
	base_q = Q()
	if area_id:
		base_q &= Q(area_id=area_id)
	if game_id:
		base_q &= Q(game_id=game_id)
	elif game_type:
		# match either game name or slug case-insensitively
		base_q &= (Q(game__name__iexact=game_type) | Q(game__slug__iexact=game_type))

	qs = GameProgress.objects.filter(base_q).order_by(f"-{score_field}")

	# exclude zeros so leaderboard shows actual scores first
	qs_nonzero = qs.exclude(**{f"{score_field}": 0})

	entries = []
	for prog in qs_nonzero[:limit]:
		entries.append(progress_to_entry(prog, difficulty))

	# If not enough nonzero results, pad with zero-score entries (optional)
	# if len(entries) < limit:
	# 	for prog in qs.filter(**{f"{score_field}": 0})[: (limit - len(entries))]:
	# 		entries.append(progress_to_entry(prog, difficulty))

	serializer = LeaderboardEntrySerializer(entries, many=True)
	return Response({"results": serializer.data})

