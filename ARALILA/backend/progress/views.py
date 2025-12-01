from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import GameProgress
from .serializers import LeaderboardEntrySerializer, progress_to_entry


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

	# Filter by area / game and order by the requested difficulty score desc
	if area_id:
		qs = GameProgress.objects.filter(area_id=area_id).order_by(f"-{score_field}")
	elif game_id:
		qs = GameProgress.objects.filter(game_id=game_id).order_by(f"-{score_field}")
	else:
		# try filtering by game name/slug using game__name or game__slug
		qs = GameProgress.objects.filter(game__name__iexact=game_type).order_by(f"-{score_field}")

	# exclude zeros so leaderboard shows actual scores first
	qs_nonzero = qs.exclude(**{f"{score_field}": 0})

	entries = []
	for prog in qs_nonzero[:limit]:
		entries.append(progress_to_entry(prog, difficulty))

	# If not enough nonzero results, pad with zero-score entries (optional)
	if len(entries) < limit:
		for prog in qs.filter(**{f"{score_field}": 0})[: (limit - len(entries))]:
			entries.append(progress_to_entry(prog, difficulty))

	serializer = LeaderboardEntrySerializer(entries, many=True)
	return Response({"results": serializer.data})

