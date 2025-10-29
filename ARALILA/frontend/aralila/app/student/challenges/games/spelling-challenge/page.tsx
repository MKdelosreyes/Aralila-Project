"use client";

import React, { useState } from "react";

import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { SpellingChallengeIntro } from "@/components/games/spelling-challenge/intro";
import { SpellingChallengeGame } from "@/components/games/spelling-challenge/game";
import { SpellingChallengeSummary } from "@/components/games/spelling-challenge/summary";
import { spellingChallengeData } from "@/data/games/spelling-challenge";
import { SpellingResult } from "@/types/games";

type GameState = "intro" | "playing" | "summary";

const SpellingChallengePage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<SpellingResult[]>([]);

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

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <SpellingChallengeGame
            words={spellingChallengeData}
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
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen  w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Background */}
      <AnimatedBackground />

      {/* Game Content */}
      <div className="w-full flex items-center justify-center">
        {renderGameState()}
      </div>
    </div>
  );
};

export default SpellingChallengePage;
