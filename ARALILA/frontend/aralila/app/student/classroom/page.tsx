"use client";

import Leaderboard from "@/components/games/common/leaderboard";

export default function GamePage() {
  return (
    <Leaderboard
      gameId={1}
      gameType="spelling-challenge"
      areaId={4}
      difficulty={1}
    />
  );
}
