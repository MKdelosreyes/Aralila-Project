"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Target, Trophy, CheckCircle2, RotateCcw } from "lucide-react";
import Leaderboard from "@/components/games/common/leaderboard";

// Interfaces
interface Question {
  id: number;
  emojis: string[];
  keywords: string[];
  translation: string;
}
export interface GameResult {
  questionData: Question;
  isCorrect: boolean;
}
interface SummaryProps {
  score: number;
  results: GameResult[];
  difficulty: number;
  starsEarned: number;
  nextDifficulty?: number;
  difficultyUnlocked?: { [k: number]: boolean };
  replayMode?: boolean;
  rawPoints?: number;
  areaId?: number;
  onRestart: () => void;
}

export const EmojiChallengeSummary = ({
  score,
  results,
  difficulty,
  starsEarned,
  nextDifficulty,
  difficultyUnlocked,
  replayMode,
  rawPoints,
  areaId = 4,
  onRestart,
}: SummaryProps) => {
  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = results.length - correct;
  const percent = score;
  const threshold = 80;
  const unlocked = {
    1: true,
    2: difficultyUnlocked?.[2] ?? false,
    3: difficultyUnlocked?.[3] ?? false,
  };
  const perfect = percent === 100 && wrong === 0;
  const passed = percent >= threshold;

  const [showReview, setShowReview] = React.useState(false);

  const getTitle = () => {
    if (perfect) return "Perfect! 🎉";
    if (passed) return "Great Job! 👏";
    return "Keep Practicing! 💪";
  };

  const getDifficultyLabel = (diff: number) => {
    return { 1: "Easy", 2: "Medium", 3: "Hard" }[diff] || "Unknown";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div
            className={`md:col-span-2 flex flex-col ${
              showReview ? "gap-4" : "justify-between min-h-[600px]"
            }`}
          >
            <div className="w-full">
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
                  <span className="text-3xl font-bold text-purple-600">
                    {percent}%
                  </span>
                  <span className="text-2xl">•</span>
                  <div className="text-center text-sm font-semibold text-gray-500 flex flex-row items-center justify-center gap-1">
                    <span>Total Score:</span>
                    <span className="font-bold text-purple-500 text-lg">
                      {rawPoints}
                    </span>
                  </div>
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
                          starNum <= starsEarned
                            ? "animate-pulse"
                            : "opacity-50"
                        }
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

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
                    {/* ✅ show once */}
                    <p className="text-2xl font-bold text-green-600">
                      {correct}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Wrong</p>
                    <p className="text-2xl font-bold text-red-600">{wrong}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {results.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Action Buttons */}
              <div className="space-y-3">
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
                <button
                  onClick={() => setShowReview((p) => !p)}
                  className="w-full bg-white border-2 border-purple-200 text-purple-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-all"
                >
                  {showReview ? "Hide Review" : "Review Answers"}
                </button>

                {/* Back to Challenges */}
                <button
                  onClick={() => window.history.back()}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
                >
                  Back to Challenges
                </button>
              </div>

              {showReview && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                    Answer Review
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {results.map((r, i) => (
                      <li
                        key={i}
                        className={`p-2 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between ${
                          r.isCorrect
                            ? "bg-green-100 border border-green-200"
                            : "bg-red-100 border border-red-200"
                        }`}
                      >
                        <span className="font-medium">
                          {i + 1}. {r.questionData.emojis.join("")}
                        </span>
                        <span className="text-gray-600">
                          Your answer:{" "}
                          <span className="font-semibold">
                            {/* {r.questionData.userAnswer || "(blank)"} */}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-1">
            <Leaderboard
              gameId={7}
              gameType="emoji-challenge"
              areaId={areaId}
              difficulty={difficulty}
              limit={10}
              variant="light"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};
