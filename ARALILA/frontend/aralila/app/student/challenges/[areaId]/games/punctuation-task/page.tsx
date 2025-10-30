"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { env } from "@/lib/env";
import { PunctuationChallengeIntro } from "@/components/games/punctuation-task/intro";
import { PunctuationChallengeGame } from "@/components/games/punctuation-task/game";
import { PunctuationChallengeSummary } from "@/components/games/punctuation-task/summary";
import { punctuationChallengeData } from "@/data/games/punctuation-task";
import { PunctuationResult } from "@/types/games";
import AnimatedBackground from "@/components/bg/animatedforest-bg";

type GameState = "intro" | "playing" | "summary";

const PunctuationChallengePage = () => {
  const router = useRouter();
  const params = useParams();
  const areaId = params.areaId as string;

  const [gameState, setGameState] = useState<GameState>("intro");
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<PunctuationResult[]>([]);

  useEffect(() => {
    if (areaId) {
      fetchAreaQuestions(areaId);
    }
  }, [areaId]);

  const fetchAreaQuestions = async (areaId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${env.backendUrl}/api/games/punctuation/${areaId}/`,
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

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({
    score,
    results,
  }: {
    score: number;
    results: PunctuationResult[];
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
    router.push(`/student/challenges/${areaId}`);
  };

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <PunctuationChallengeGame
            sentences={questions}
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
        return (
          <PunctuationChallengeIntro
            onStartChallenge={handleStart}
            onBack={handleBack}
          />
        );
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
