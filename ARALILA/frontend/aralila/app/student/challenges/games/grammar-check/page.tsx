"use client";

import React, { useEffect, useState } from "react";

import AnimatedBackground from "@/components/bg/animatedforest-bg"; // Assuming you have this
import { GrammarCheckIntro } from "@/components/games/grammar-check/intro";
import { GrammarCheckGame } from "@/components/games/grammar-check/game";
import {
  GrammarCheckSummary,
  GrammarResult,
} from "@/components/games/grammar-check/summary";
import { grammarAccuracyQuestions } from "@/data/GrammarAccuracyData";

type GameState = "intro" | "playing" | "summary";

const GrammarCheckPage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<GrammarResult[]>([]);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({
    score,
    results,
  }: {
    score: number;
    results: GrammarResult[];
  }) => {
    setFinalScore(score);
    setFinalResults(results);
    setGameState("summary");
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
          <GrammarCheckGame
            questions={grammarAccuracyQuestions}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <GrammarCheckSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return <GrammarCheckIntro onStartChallenge={handleStart} />;
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

export default GrammarCheckPage;
