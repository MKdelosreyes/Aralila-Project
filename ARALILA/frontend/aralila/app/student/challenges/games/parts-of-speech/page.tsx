"use client";

import React, { useState } from "react";

import AnimatedBackground from "@/components/bg/animatedforest-bg"; 
import { PartsOfSpeechIntro } from "@/components/games/parts-of-speech/intro";
import { PartsOfSpeechGame } from "@/components/games/parts-of-speech/game";
import { PartsOfSpeechSummary, PartsOfSpeechResult } from "@/components/games/parts-of-speech/summary"; // Create this summary component
import { partsOfSpeechData } from "@/data/games/parts-of-speech"; // Create this data file
import { PartsOfSpeechDifficulty } from "@/types/games"; // Assuming this type is defined

type GameState = "intro" | "playing" | "summary";

const PartsOfSpeechPage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<PartsOfSpeechResult[]>([]);
  const [difficulty, setDifficulty] = useState<PartsOfSpeechDifficulty>("medium"); // Default difficulty

  const handleStart = (selectedDifficulty: PartsOfSpeechDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState("playing");
  };

  const handleGameComplete = ({ score, results }: { score: number; results: PartsOfSpeechResult[] }) => {
    setFinalScore(score);
    setFinalResults(results);
    setGameState("summary");
  };

  const handleReviewLessons = () => {
    console.log("Review lessons clicked for Parts of Speech");
    // Implement navigation to relevant lessons
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
          <PartsOfSpeechGame
            questions={partsOfSpeechData} // Use your partsOfSpeechData
            difficulty={difficulty}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <PartsOfSpeechSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
            onReviewLessons={handleReviewLessons} // Add this prop to summary
          />
        );
      case "intro":
      default:
        return <PartsOfSpeechIntro
          onStartChallenge={handleStart}
          onReviewLessons={handleReviewLessons}
        />;
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

export default PartsOfSpeechPage;