"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { GrammarCheckIntro } from "@/components/games/grammar-check/intro";
import { GrammarCheckGame } from "@/components/games/grammar-check/game";
import {
  GrammarCheckSummary,
  GrammarResult,
} from "@/components/games/grammar-check/summary";
import { grammarAccuracyQuestions } from "@/data/GrammarAccuracyData";

type GameState = "intro" | "playing" | "summary";

const GrammarCheckPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("areaId");
  const [gameState, setGameState] = useState<GameState>("intro");
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<GrammarResult[]>([]);

  useEffect(() => {
    // Fetch grammar questions for this specific area
    if (areaId) {
      fetchAreaQuestions(areaId);
    }
  }, [areaId]);

  const fetchAreaQuestions = async (areaId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/games/grammar/${areaId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleBack = () => {
    router.push("/student/challenges");
  };

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <GrammarCheckGame
            questions={questions}
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
        return (
          <GrammarCheckIntro
            onStartChallenge={handleStart}
            onBack={handleBack}
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

export default GrammarCheckPage;
