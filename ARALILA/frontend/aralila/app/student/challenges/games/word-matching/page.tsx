"use client";

import React, { useState } from "react";

import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { WordMatchingIntro } from "@/components/games/word-matching/intro";
import { WordMatchingGame } from "@/components/games/word-matching/game";
import { WordMatchingSummary, MatchingResult } from "@/components/games/word-matching/summary";
import { wordMatchingData } from "@/data/games/word-matching";

type GameState = "intro" | "playing" | "summary";

const WordMatchingPage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<MatchingResult[]>([]);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({ score, results }: { score: number; results: MatchingResult[] }) => {
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
          <WordMatchingGame
            wordPairs={wordMatchingData}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <WordMatchingSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return (
          <WordMatchingIntro
            onStartChallenge={handleStart}
            onReviewLessons={handleReviewLessons}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Background */}
      <AnimatedBackground />

      {/* Game Content */}
      <div className="w-full flex items-center justify-center">
        {renderGameState()}
      </div>
    </div>
  );
};

export default WordMatchingPage;