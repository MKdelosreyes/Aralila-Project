"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { env } from "@/lib/env";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { PartsOfSpeechIntro } from "@/components/games/parts-of-speech/intro";
import { PartsOfSpeechGame } from "@/components/games/parts-of-speech/game";
import { PartsOfSpeechSummary } from "@/components/games/parts-of-speech/summary";
import { partsOfSpeechData } from "@/data/games/parts-of-speech";
import { PartsOfSpeechDifficulty, PartsOfSpeechResult } from "@/types/games";

type GameState = "intro" | "playing" | "summary";

const PartsOfSpeechPage = () => {
  const router = useRouter();
  const params = useParams();
  const areaId = params.areaId as string;

  const [gameState, setGameState] = useState<GameState>("intro");
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<PartsOfSpeechResult[]>([]);
  const [difficulty, setDifficulty] =
    useState<PartsOfSpeechDifficulty>("medium");

  useEffect(() => {
    if (areaId) {
      fetchAreaQuestions(areaId);
    }
  }, [areaId]);

  const fetchAreaQuestions = async (areaId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${env.backendUrl}/api/games/parts-of-speech/${areaId}/`,
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
          <PartsOfSpeechGame
            questions={questions}
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
            onReviewLessons={handleReviewLessons}
          />
        );
      case "intro":
      default:
        return (
          <PartsOfSpeechIntro
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

export default PartsOfSpeechPage;
