"use client";

import React, { useState } from "react";
import AnimatedBackground from "@/components/bg/animatedforest-bg"; 
import { WordAssociationIntro } from "@/components/games/word-association/intro";
import { WordAssociationGame } from "@/components/games/word-association/game";
import { WordAssociationSummary, WordAssociationResult } from "@/components/games/word-association/summary";
import { fourPicsOneWordQuestions as questions } from "@/data/WordAssociationData";

type GameState = "intro" | "playing" | "summary";


const WordAssociationPage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<WordAssociationResult[]>([]);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({ score, results }: { score: number; results: WordAssociationResult[] }) => {
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
          <WordAssociationGame
            questions={questions}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <WordAssociationSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return <WordAssociationIntro onStartChallenge={handleStart} />;
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

export default WordAssociationPage;