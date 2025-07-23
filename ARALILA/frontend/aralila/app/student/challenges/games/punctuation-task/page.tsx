// /app/punctuation-challenge/page.tsx

"use client";

import React, { useState } from "react";
import { PunctuationChallengeIntro } from "@/components/games/punctuation-task/intro";
import { PunctuationChallengeGame } from "@/components/games/punctuation-task/game";
import { PunctuationChallengeSummary } from "@/components/games/punctuation-task/summary";
import { punctuationChallengeData } from "@/data/games/punctuation-task";
import { PunctuationResult } from "@/types/games";
import AnimatedBackground from "@/components/bg/animatedforest-bg"; // Assuming a generic animated background

type GameState = "intro" | "playing" | "summary";

const PunctuationChallengePage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<PunctuationResult[]>([]);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({ score, results }: { score: number; results: PunctuationResult[] }) => {
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
          <PunctuationChallengeGame
            sentences={punctuationChallengeData}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <PunctuationChallengeSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return <PunctuationChallengeIntro onStartChallenge={handleStart} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-800">
      <AnimatedBackground />
      <div className="w-full flex items-center justify-center">
        {renderGameState()}
      </div>
    </div>
  );
};

export default PunctuationChallengePage;