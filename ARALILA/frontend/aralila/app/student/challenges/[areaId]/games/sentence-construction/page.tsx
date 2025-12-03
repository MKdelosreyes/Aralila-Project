"use client";

import React, { useState } from "react";

import AnimatedBackground from "@/components/bg/animatedforest-bg"; // Assuming path
import { SentenceConstructionIntro } from "@/components/games/sentence-construction/intro";
import { SentenceConstructionGame } from "@/components/games/sentence-construction/game";
import {
  SentenceConstructionSummary,
  SentenceResult,
} from "@/components/games/sentence-construction/summary";
import { sentenceArrangementChallenges } from "@/data/SentenceConstructionData";
import { TutorialModal } from "../TutorialModal";

type GameState = "intro" | "playing" | "summary";

const SentenceConstructionPage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<SentenceResult[]>([]);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({
    score,
    results,
  }: {
    score: number;
    results: SentenceResult[];
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
          <SentenceConstructionGame
            questions={sentenceArrangementChallenges}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <SentenceConstructionSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return <SentenceConstructionIntro onStartChallenge={handleStart} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Background */}
      <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />

      {/* Game Content */}
      <div className="w-full flex items-center justify-center">
        {renderGameState()}
      </div>
    </div>
  );
};

export default SentenceConstructionPage;
