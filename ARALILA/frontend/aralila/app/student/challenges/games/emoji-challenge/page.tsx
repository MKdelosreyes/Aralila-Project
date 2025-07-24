"use client";

import React, { useState } from "react";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { EmojiChallengeIntro } from "@/components/games/emoji-challenge/intro";
import { EmojiHulaSalitaGame } from "@/components/games/emoji-challenge/game";
import { EmojiChallengeSummary, GameResult } from "@/components/games/emoji-challenge/summary";
import { emojiSentenceChallenges } from "@/data/EmojiData"; // ✅ IMPORTED FROM DATA FILE

type GameState = "intro" | "playing" | "summary";

const EmojiChallengePage = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<GameResult[]>([]);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({ score, results }: { score: number; results: GameResult[] }) => {
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
          <EmojiHulaSalitaGame
            questions={emojiSentenceChallenges} // ✅ UPDATED TO USE IMPORTED DATA
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
        return <EmojiChallengeIntro onStartChallenge={handleStart} />;
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
