"use client";

import React from "react";
import { motion } from "framer-motion";
import { SpellingResult } from "@/types/games";
import { Trophy, Star, Zap, RotateCcw } from "lucide-react";
import Image from "next/image";

interface SummaryProps {
  score: number;
  results: SpellingResult[];
  difficulty: number;
  starsEarned: number;
  unlockedMessage?: string;
  canSkip?: boolean;
  nextDifficulty?: number;
  replayMode?: boolean;
  onRestart: () => void;
  onNextDifficulty?: () => void;
  onSkipToHard?: () => void;
}

export const SpellingChallengeSummary = ({
  score,
  results,
  difficulty,
  starsEarned,
  unlockedMessage,
  canSkip,
  nextDifficulty,
  replayMode,
  onRestart,
  onNextDifficulty,
  onSkipToHard,
}: SummaryProps) => {
  const passed = score >= (difficulty === 1 ? 60 : difficulty === 2 ? 70 : 80);
  const perfect = score >= 90;

  const getTitle = () => {
    if (perfect) return "Perfect! 🎉";
    if (passed) return "Great Job! 👏";
    return "Keep Practicing! 💪";
  };

  const getDifficultyLabel = (diff: number) => {
    return { 1: "Easy", 2: "Medium", 3: "Hard" }[diff] || "Unknown";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-20 bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl font-bold text-gray-800 mb-2"
        >
          {getTitle()}
        </motion.h2>

        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
          <span className="text-sm font-medium">
            {getDifficultyLabel(difficulty)} Mode
          </span>
          <span className="text-2xl">•</span>
          <span className="text-3xl font-bold text-purple-600">{score}%</span>
        </div>

        {/* Stars Display */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((starNum) => (
            <motion.div
              key={starNum}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 * starNum, type: "spring" }}
            >
              <Image
                src={
                  starNum <= starsEarned
                    ? "/images/art/Active-Star.png"
                    : "/images/art/Inactive-Star.png"
                }
                alt={`star-${starNum}`}
                width={60}
                height={60}
                className={
                  starNum <= starsEarned ? "animate-pulse" : "opacity-50"
                }
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unlock Message */}
      {unlockedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-xl p-4 mb-6"
        >
          <p className="text-purple-800 font-semibold text-center flex items-center justify-center gap-2">
            {canSkip && <Zap className="text-yellow-500" size={20} />}
            {unlockedMessage}
          </p>
        </motion.div>
      )}

      {/* Replay Mode Badge */}
      {replayMode && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-3 mb-6 text-center">
          <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
            <Trophy size={20} />
            Mastery Unlocked! Play any difficulty
          </p>
        </div>
      )}

      {/* Results Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-500 text-sm">Correct</p>
            <p className="text-2xl font-bold text-green-600">
              {results.filter((r) => r.isCorrect).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Wrong</p>
            <p className="text-2xl font-bold text-red-600">
              {results.filter((r) => !r.isCorrect).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-2xl font-bold text-gray-700">{results.length}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Skip to Hard (if 90%+ on Easy) */}
        {canSkip && difficulty === 1 && onSkipToHard && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onSkipToHard}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
          >
            <Zap size={20} fill="white" />
            Skip to Hard Difficulty!
          </motion.button>
        )}

        {/* Continue to Next Difficulty */}
        {passed &&
          nextDifficulty &&
          nextDifficulty <= 3 &&
          onNextDifficulty &&
          !canSkip && (
            <button
              onClick={onNextDifficulty}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
            >
              <Star size={20} fill="white" />
              Continue to {getDifficultyLabel(nextDifficulty)}
            </button>
          )}

        {/* Retry Current Difficulty */}
        <button
          onClick={onRestart}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
        >
          <RotateCcw size={20} />
          {replayMode
            ? "Play Again"
            : passed
            ? "Retry for Better Score"
            : "Try Again"}
        </button>

        {/* Back to Challenges */}
        <button
          onClick={() => window.history.back()}
          className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
        >
          Back to Challenges
        </button>
      </div>
    </motion.div>
  );
};
