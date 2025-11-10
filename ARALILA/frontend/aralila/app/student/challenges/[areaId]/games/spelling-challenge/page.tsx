"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { SpellingChallengeIntro } from "@/components/games/spelling-challenge/intro";
import { SpellingChallengeGame } from "@/components/games/spelling-challenge/game";
import { SpellingChallengeSummary } from "@/components/games/spelling-challenge/summary";
import { SpellingResult } from "@/types/games";

type GameState = "intro" | "playing" | "summary";

const SpellingChallengePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area") || "1";
  const initialDifficulty = parseInt(searchParams.get("difficulty") || "1");

  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty);
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<SpellingResult[]>([]);
  const [gameData, setGameData] = useState<any>(null);

  // ✅ NEW: Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions(areaId, currentDifficulty);
  }, [areaId, currentDifficulty]);

  const fetchQuestions = async (rawAreaParam: string, difficulty: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        router.push("/auth/login");
        return;
      }

      // 1. Treat incoming param as order_index, resolve real area id
      const orderIndex = parseInt(rawAreaParam, 10);
      let actualAreaId = orderIndex;

      try {
        const areaResp = await fetch(
          `${env.backendUrl}/api/games/area/order/${orderIndex}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (areaResp.ok) {
          const areaData = await areaResp.json();
          actualAreaId = areaData.area.id; // ✅ real DB id
        } else {
          // fallback: assume param already is an id
          console.warn("Area-by-order lookup failed, using raw param as id.");
        }
      } catch (e) {
        console.warn("Area-by-order request error, using raw param as id.");
      }

      // 2. Fetch questions with resolved area id
      const response = await fetch(
        `${env.backendUrl}/api/games/questions/${actualAreaId}/spelling-challenge/${difficulty}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 403) {
        const data = await response.json();
        setError(data.error || "Access denied");
        alert(data.error);
        router.back();
        return;
      }

      if (response.status === 500) {
        let errorDetails = "Internal server error. Please try again later.";
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorDetails;
        } catch {}
        setError(errorDetails);
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.questions || data.questions.length === 0) {
        setError("No questions available for this difficulty level.");
        return;
      }

      setQuestions(data.questions);
      setGameData(data);
      if (data.skip_message) {
        console.log("Skip message:", data.skip_message);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (questions.length > 0) {
      setGameState("playing");
    }
  };

  const handleGameComplete = async ({
    score,
    results,
  }: {
    score: number;
    results: SpellingResult[];
  }) => {
    setFinalScore(score);
    setFinalResults(results);

    // Submit score to backend
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${env.backendUrl}/api/games/submit-score/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            area_id: areaId,
            game_type: "spelling-challenge",
            difficulty: currentDifficulty,
            score: score,
          }),
        }
      );

      const data = await response.json();
      setGameData((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Failed to submit score:", error);
    }

    setGameState("summary");
  };

  const handleRestart = () => {
    setGameState("intro");
    setFinalScore(0);
    setFinalResults([]);
    fetchQuestions(areaId, currentDifficulty);
  };

  const handleNextDifficulty = () => {
    if (gameData?.next_difficulty) {
      setCurrentDifficulty(gameData.next_difficulty);
      setGameState("intro");
      setFinalScore(0);
      setFinalResults([]);
    }
  };

  const handleSkipToHard = () => {
    setCurrentDifficulty(3);
    setGameState("intro");
    setFinalScore(0);
    setFinalResults([]);
  };

  const handleBack = () => {
    router.push(`/student/challenges?area=${areaId}`);
  };

  // ✅ NEW: Loading screen
  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground />
        <div className="relative z-20 bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
            <p className="text-gray-700 font-semibold">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NEW: Error screen
  if (error) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground />
        <div className="relative z-20 bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold text-red-600">Oops!</h2>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
            >
              Go Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <SpellingChallengeGame
            words={questions}
            difficulty={currentDifficulty}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <SpellingChallengeSummary
            score={finalScore}
            results={finalResults}
            difficulty={currentDifficulty}
            starsEarned={gameData?.stars_earned || 0}
            unlockedMessage={gameData?.unlocked_message}
            canSkip={gameData?.can_skip}
            nextDifficulty={gameData?.next_difficulty}
            replayMode={gameData?.replay_mode}
            onRestart={handleRestart}
            onNextDifficulty={handleNextDifficulty}
            onSkipToHard={handleSkipToHard}
          />
        );
      case "intro":
      default:
        return (
          <SpellingChallengeIntro
            difficulty={currentDifficulty}
            skipMessage={gameData?.skip_message}
            onStartChallenge={handleStart}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="w-full flex items-center justify-center">
        {renderGameState()}
      </div>
    </div>
  );
};

export default SpellingChallengePage;
