"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { WordAssociationIntro } from "@/components/games/word-association/intro";
import { WordAssociationGame } from "@/components/games/word-association/game";
import {
  WordAssociationSummary,
  WordAssociationResult,
} from "@/components/games/word-association/summary";
import { fourPicsOneWordQuestions as questions } from "@/data/WordAssociationData";

type GameState = "intro" | "playing" | "summary";

const WordAssociationPage = () => {
  const router = useRouter();
  const params = useParams();
  const areaId = params.areaId as string;

  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<WordAssociationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({
    score,
    results,
  }: {
    score: number;
    results: WordAssociationResult[];
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

  const getAreaBGImage = () => {
    if (Number(areaId) === null) {
      return "/images/bg/forestbg-learn.jpg";
    }

    if (Number(areaId) === 4) return "/images/bg/Playground.png";
    else if (Number(areaId) === 5) return "/images/bg/Classroom.png";
    else if (Number(areaId) === 6) return "/images/bg/Home.png";
    else if (Number(areaId) === 7) return "/images/bg/Town.png";
    else if (Number(areaId) === 8) return "/images/bg/Mountainside.png";
    else return "/images/bg/Playground.png";
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground imagePath={getAreaBGImage()} />
        <div className="relative z-20 rounded-3xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
            <p className="text-white font-semibold">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground imagePath={getAreaBGImage()} />
        <div className="relative z-20 bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold text-red-600">Oops!</h2>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
            >
              Go Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        return (
          <WordAssociationIntro
            onStartChallenge={handleStart}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <AnimatedBackground imagePath={getAreaBGImage()} />
      <div className="w-full flex items-center justify-center">
        {renderGameState()}
      </div>
    </div>
  );
};

export default WordAssociationPage;
