"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Target, Trophy, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { PunctuationResult } from "@/types/games";
import { splitIntoWords } from "@/data/games/punctuation-task";
import Leaderboard from "@/components/games/common/Leaderboard";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ReviewModal = ({ isOpen, onClose, children }: ReviewModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-md bg-opacity-60 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-slate-800">
                Question Review
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-800 transition-colors"
              >
                <XCircle size={28} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
  borderClass: string;
}

const StatCard = ({
  icon,
  label,
  value,
  colorClass,
  borderClass,
}: StatCardProps) => (
  <motion.div
    className={`bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center border-2 ${borderClass}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${colorClass}`}
    >
      {icon}
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-sm text-slate-500 mt-1">{label}</div>
  </motion.div>
);

interface SummaryProps {
  score: number;
  results: PunctuationResult[];
  difficulty: number;
  starsEarned: number;
  nextDifficulty?: number;
  difficultyUnlocked?: { [k: number]: boolean };
  replayMode?: boolean;
  rawPoints?: number;
  onRestart?: () => void;
  onChangeDifficulty: (d: number) => void;
}

const buildCorrectSentence = (result: PunctuationResult) => {
  const words = splitIntoWords(result.sentenceData.sentence);
  const gaps = [...result.sentenceData.correctPunctuation].sort((a, b) => {
    const aa = a.position === -1 ? Number.MAX_SAFE_INTEGER : a.position;
    const bb = b.position === -1 ? Number.MAX_SAFE_INTEGER : b.position;
    return aa - bb;
  });

  let out: string[] = [];
  let start = 0;
  gaps.forEach((g) => {
    const end = g.position === -1 ? words.length : g.position + 1;
    out.push(words.slice(start, end).join(" "));
    out.push(g.mark);
    start = end;
  });
  if (start < words.length) out.push(words.slice(start).join(" "));
  return out.join(" ").replace(/\s+([,;:?!."'])/g, "$1");
};

export const PunctuationChallengeSummary = ({
  score,
  results,
  difficulty,
  starsEarned,
  nextDifficulty,
  difficultyUnlocked,
  replayMode,
  rawPoints,
  onRestart,
  onChangeDifficulty,
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalQuestions = results.length;
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let summaryContent = {
    title: "Good Effort!",
    imageSrc: "/images/character/lila-normal.png",
    showConfetti: false,
  };
  if (accuracy === 100) {
    summaryContent = {
      title: "Perfect Score!",
      imageSrc: "/images/character/lila-happy.png",
      showConfetti: true,
    };
  } else if (accuracy >= 80) {
    summaryContent = {
      title: "Excellent Work!",
      imageSrc: "/images/character/lila-happy.png",
      showConfetti: true,
    };
  } else if (accuracy < 20) {
    summaryContent = {
      title: "Keep Practicing!",
      imageSrc: "/images/character/lila-crying.png",
      showConfetti: false,
    };
  } else if (accuracy < 40) {
    summaryContent = {
      title: "Better Luck Next Time!",
      imageSrc: "/images/character/lila-sad.png",
      showConfetti: false,
    };
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
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
                {rawPoints !== undefined && (
                  <p className="text-center text-sm text-gray-500 mb-2">
                    Raw Points: {rawPoints}
                  </p>
                )}
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
                className="w-full bg-white border-2 border-blue-300 text-blue-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
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
                        {i + 1}. {buildCorrectSentence(r)}
                      </span>
                      <span className="text-gray-600">
                        Your answer:{" "}
                        <span className="font-semibold">
                          {r.userAnswer.length > 0
                            ? r.userAnswer.map((a) => `${a.mark}`).join(", ")
                            : "No Answer"}
                        </span>
                        {r.isCorrect
                          ? "✓"
                          : `→ Correct: ${r.sentenceData.correctPunctuation
                              .map((p) => p.mark)
                              .join(", ")}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="md:col-span-1">
            <Leaderboard
              gameId={3}
              gameType="punctuation-task"
              areaId={4}
              difficulty={difficulty}
              limit={10}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};
