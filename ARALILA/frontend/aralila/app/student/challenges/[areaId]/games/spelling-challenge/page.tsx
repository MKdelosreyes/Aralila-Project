"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { env } from "@/lib/env";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { SpellingChallengeIntro } from "@/components/games/spelling-challenge/intro";
import { SpellingChallengeGame } from "@/components/games/spelling-challenge/game";
import { SpellingChallengeSummary } from "@/components/games/spelling-challenge/summary";
import { spellingChallengeData } from "@/data/games/spelling-challenge";
import { SpellingResult } from "@/types/games";

type GameState = "intro" | "playing" | "summary";

const SpellingChallengePage = () => {
  const router = useRouter();
  const params = useParams();
  const areaId = params.areaId as string;

  const [gameState, setGameState] = useState<GameState>("intro");
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<SpellingResult[]>([]);

  useEffect(() => {
    if (areaId) {
      fetchAreaQuestions(areaId);
    }
  }, [areaId]);

  const fetchAreaQuestions = async (areaId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${env.backendUrl}/api/games/spelling/${areaId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({
    score,
    results,
  }: {
    score: number;
    results: SpellingResult[];
  }) => {
    setFinalScore(score);
    setFinalResults(results);
    setGameState("summary");
  };

  const handleReviewLessons = () => {
    console.log("Review lessons clicked");
  };

  const handleRestart = () => {
    setGameState("intro");
    setFinalScore(0);
    setFinalResults([]);
  };

  const handleBack = () => {
    router.push(`/student/challenges/${areaId}`);
  };

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <SpellingChallengeGame
            words={questions}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <SpellingChallengeSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return (
          <SpellingChallengeIntro
            onStartChallenge={handleStart}
            onReviewLessons={handleReviewLessons}
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
