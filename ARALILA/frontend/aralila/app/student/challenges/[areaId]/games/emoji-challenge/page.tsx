"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { EmojiChallengeIntro } from "@/components/games/emoji-challenge/intro";
import { EmojiHulaSalitaGame } from "@/components/games/emoji-challenge/game";
import {
  EmojiChallengeSummary,
  GameResult,
} from "@/components/games/emoji-challenge/summary";
import { emojiSentenceChallenges } from "@/data/EmojiData";

type GameState = "intro" | "playing" | "summary";

const EmojiChallengePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("areaId");
  const [gameState, setGameState] = useState<GameState>("intro");
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<GameResult[]>([]);

  useEffect(() => {
    // Fetch emoji questions for this specific area
    if (areaId) {
      fetchAreaQuestions(areaId);
    }
  }, [areaId]);

  const fetchAreaQuestions = async (areaId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/games/emoji/${areaId}/`, {
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
    results: GameResult[];
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
    // Go back to area challenges page
    router.push(`/student/challenges/${areaId}`);
  };

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <EmojiHulaSalitaGame
            questions={questions}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <EmojiChallengeSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return (
          <EmojiChallengeIntro
            onStartChallenge={handleStart}
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

export default EmojiChallengePage;
