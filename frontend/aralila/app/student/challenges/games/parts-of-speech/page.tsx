"use client";

import React, { useState, useEffect } from "react";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { PartsOfSpeechIntro } from "@/components/games/parts-of-speech/intro";
import { PartsOfSpeechGame } from "@/components/games/parts-of-speech/game";
import { PartsOfSpeechSummary } from "@/components/games/parts-of-speech/summary"; // Create this summary component
import { PartsOfSpeechQuestion, PartsOfSpeechResult } from "@/types/games";
import { partOfSpeechData } from "@/data/games/parts-of-speech";
import { PartsOfSpeechDifficulty } from "@/types/games"; // Assuming this type is defined
import { partOfSpeechAPI } from "@/lib/api/partsOfSpeech";

type GameState = "intro" | "playing" | "summary";

// export interface PartsOfSpeechQuestion {
//   id: number;
//   sentence: string;
//   word: string;
//   options: string[];
//   correctAnswer: string;
//   hint: string;
//   explanation: string;
// }

const PartsOfSpeechPage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<PartsOfSpeechResult[]>([]);
  const [difficulty, setDifficulty] =
    useState<PartsOfSpeechDifficulty>("medium"); // Default difficulty
  const [questions, setQuestions] = useState<PartsOfSpeechQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       const itemData = await partOfSpeechAPI.getPartsOfSpeechQuestions();
  //       console.log("Retrieved items successfully!");
  //       setQuestions(itemData);
  //     } catch (err) {
  //       console.log(error);
  //       setError("Failed to load data.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadData();
  // }, []);

  const handleStart = (selectedDifficulty: PartsOfSpeechDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState("playing");
  };

  const handleGameComplete = ({
    score,
    results,
  }: {
    score: number;
    results: PartsOfSpeechResult[];
  }) => {
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
            questions={partOfSpeechData} // Use your partsOfSpeechData
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
            onReviewLessons={handleReviewLessons}
          />
        );
      case "intro":
      default:
        return (
          <PartsOfSpeechIntro
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

export default PartsOfSpeechPage;
