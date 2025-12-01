"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { GrammarCheckIntro } from "@/components/games/grammar-check/intro";
import { GrammarCheckGame } from "@/components/games/grammar-check/game";
import {
  GrammarCheckSummary,
  GrammarResult,
} from "@/components/games/grammar-check/summary";
import { grammarAccuracyQuestions } from "@/data/GrammarAccuracyData";
import { buildRuntimeQuestions, RuntimeGrammarQuestion } from "@/lib/utils";

type GameState = "intro" | "playing" | "summary";

const GrammarCheckPage = () => {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black text-white">
          <div>Loading...</div>
        </div>
      }
    >
      <GrammarCheckPageInner />
    </Suspense>
  );
};

function GrammarCheckPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("areaId");

  const [gameState, setGameState] = useState<GameState>("intro");
  const [questions, setQuestions] = useState<RuntimeGrammarQuestion[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<GrammarResult[]>([]);

  useEffect(() => {
    setQuestions(buildRuntimeQuestions(grammarAccuracyQuestions));
  }, []);

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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Background */}
      <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />

      {/* Game Content */}
      <div className="w-full flex items-center justify-center">
        {/* Uncomment when ready to render the game flow */}
        {/* {gameState === "playing" ? (
          <GrammarCheckGame
            questions={questions}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        ) : gameState === "summary" ? (
          <GrammarCheckSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        ) : (
          <GrammarCheckIntro onStartChallenge={handleStart} onBack={handleBack} />
        )} */}
      </div>
    </div>
  );
}

export default GrammarCheckPage;

// Optional: if build still prerenders and fails, force dynamic rendering:
// export const dynamic = 'force-dynamic';
