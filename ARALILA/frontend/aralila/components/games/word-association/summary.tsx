"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { WordAssociationResult } from "./game";
import Leaderboard from "@/components/games/common/leaderboard";

interface SummaryProps {
  score: number;
  results: WordAssociationResult[];
  difficulty: number;
  starsEarned: number;
  nextDifficulty?: number;
  difficultyUnlocked?: { [k: number]: boolean };
  replayMode?: boolean;
  rawPoints?: number;
  onRestart: () => void;
  areaId?: number;
}

export const WordAssociationSummary = ({
  score,
  results,
  difficulty,
  starsEarned,
  onRestart,
  areaId,
}: SummaryProps) => {
  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = results.length - correct;
  const percent =
    results.length > 0 ? Math.round((correct / results.length) * 100) : 0;

  const perfect = percent === 100 && wrong === 0;
  const passed = percent >= 80;

  const [showReview, setShowReview] = React.useState(false);

  const getTitle = () => {
    if (perfect) return "Perfect! 🎉";
    if (passed) return "Excellent Work! 👏";
    if (percent < 20) return "Keep Practicing! 💪";
    return "Good Effort!";
  };

  // determine max stars allowed by difficulty (easy=1, medium=2, hard=3)
  const maxStars = difficulty
    ? Math.min(3, Math.max(1, Math.floor(difficulty)))
    : 3;

  const calculateStars = (pct: number, max: number) => {
    if (max === 3) {
      if (pct === 100) return 3;
      if (pct >= 80) return 2;
      if (pct >= 50) return 1;
      return 0;
    }
    if (max === 2) {
      if (pct === 100) return 2;
      if (pct >= 70) return 1;
      return 0;
    }
    // max === 1
    return pct >= 50 ? 1 : 0;
  };

  const earnedStars =
    typeof starsEarned === "number"
      ? starsEarned
      : calculateStars(percent, maxStars);

  // Persisting stars is handled by the page (submit-score) — no client-side POST here to avoid duplicates.

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-20 bg-white rounded-3xl p-8 w-full shadow-2xl"
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
              <span className="text-sm font-medium">Word Association</span>
              <span className="text-2xl">•</span>
              <span className="text-3xl font-bold text-purple-600">
                {percent}%
              </span>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: s * 0.2, type: "spring" }}
                >
                  <Image
                    src={
                      s <= earnedStars
                        ? "/images/art/Active-Star.png"
                        : "/images/art/Inactive-Star.png"
                    }
                    alt={`star-${s}`}
                    width={60}
                    height={60}
                    className={
                      s <= earnedStars ? "animate-pulse" : "opacity-50"
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-sm">Correct</p>
                <p className="text-2xl font-bold text-green-600">{correct}</p>
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

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onRestart}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
            >
              <RotateCcw size={20} />
              {passed ? "Retry for Better Score" : "Try Again"}
            </button>

            <button
              onClick={() => setShowReview((p) => !p)}
              className="w-full bg-white border-2 border-purple-200 text-purple-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-all"
            >
              {showReview ? "Hide Review" : "Review Answers"}
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
            >
              Back to Challenges
            </button>
          </div>

          {/* Review Section */}
          {showReview && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                Answer Review
              </h3>
              <ul className="space-y-3 text-sm">
                {results.map((r, i) => (
                  <li
                    key={i}
                    className={`p-3 rounded-lg ${
                      r.isCorrect
                        ? "bg-green-100 border border-green-200"
                        : "bg-red-100 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium mb-1">
                      {r.isCorrect ? (
                        <CheckCircle2 className="text-green-600" />
                      ) : (
                        <XCircle className="text-red-600" />
                      )}
                      <span>
                        {i + 1}. {r.questionData.answer}
                      </span>
                    </div>

                    {!r.isCorrect && (
                      <p className="text-red-700 mb-1 text-sm">
                        Your answer:{" "}
                        <span className="font-semibold">
                          {r.userAnswer || "(blank)"}
                        </span>
                      </p>
                    )}

                    <p className="text-gray-600 text-xs">
                      {r.questionData.hint}
                    </p>

                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {r.questionData.images.map((src, idx) => (
                        <Image
                          key={idx}
                          src={src}
                          alt=""
                          width={100}
                          height={100}
                          className="rounded-md object-cover"
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>

      <div className="md:col-span-1">
        <Leaderboard
          gameId={5}
          gameType="word-association"
          areaId={4}
          difficulty={difficulty}
          limit={10}
          variant="light"
        />
      </div>
    </div>
  );
};
