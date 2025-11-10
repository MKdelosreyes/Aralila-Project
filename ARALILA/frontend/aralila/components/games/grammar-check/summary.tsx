"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Target, Trophy, XCircle } from "lucide-react";

// --- Interfaces ---
// interface GrammarError {
//   word: string;
//   errorType: string;
//   explanation: string;
//   correct: string;
interface Question {
  id: number;
  correctTokens: string[];
  jumbledTokens: string[];
}

export interface GrammarResult {
  question: Question;
  userAnswer: string[]; // array of selected words
  isCorrect: boolean;
}
interface GrammarChallengeSummaryProps {
  score: number;
  results: GrammarResult[];
  onRestart: () => void;
}
// --- Helper Components ---
const ReviewModal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => (
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
          className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">
              Sentence Review
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

const StatCard = ({
  icon,
  label,
  value,
  colorClass,
  borderClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
  borderClass: string;
}) => (
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

// --- Main Summary Component ---
export const GrammarCheckSummary = ({
  score,
  results,
}: GrammarChallengeSummaryProps) => {
  const router = useRouter();
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
      title: "Perfect!",
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
      title: "Needs Improvement",
      imageSrc: "/images/character/lila-sad.png",
      showConfetti: false,
    };
  }

  // const incorrectResults = results.filter((r) => !r.isCorrect);

  return (
    <>
      <motion.div
        className="relative z-10 bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 max-w-2xl w-full text-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {summaryContent.showConfetti && windowSize.width > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
          />
        )}
        <Image
          src={summaryContent.imageSrc}
          alt="Lila character"
          width={150}
          height={150}
          className="mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold text-purple-700 mb-2">
          {summaryContent.title}
        </h1>
        <p className="text-slate-500 mb-8">
          Here&apos;s a summary of your performance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
          <StatCard
            icon={<Trophy className="w-6 h-6 text-yellow-600" />}
            label="Final Score"
            value={score}
            colorClass="bg-yellow-100"
            borderClass="border-yellow-400"
          />
          <StatCard
            icon={<Target className="w-6 h-6 text-green-600" />}
            label="Accuracy"
            value={`${accuracy}%`}
            colorClass="bg-green-100"
            borderClass="border-green-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-4">
          <button
            onClick={() => router.push("/student/challenges")}
            className="w-full sm:w-auto inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            CONTINUE
          </button>
          {results.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto inline-block bg-transparent hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-xl border-2 border-slate-300 transition-all duration-300"
            >
              REVIEW ANSWERS
            </button>
          )}
        </div>
      </motion.div>

      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="overflow-y-auto pr-2 -mr-2">
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-xl border ${
                  result.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <p className="text-slate-600 text-sm mb-1">
                  Scrambled Sentence:
                </p>
                <p className="text-slate-800 p-2 bg-slate-100 rounded-md mb-3">
                  {result.question.jumbledTokens.join(" ")}
                </p>

                <p className="text-slate-600 text-sm mb-1">Your Answer:</p>
                <p
                  className={`text-slate-800 p-2 rounded-md mb-3 ${
                    result.isCorrect ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {result.userAnswer.join(" ")}
                </p>

                {!result.isCorrect && (
                  <>
                    <p className="text-slate-600 text-sm mb-1">
                      Correct Answer:
                    </p>
                    <p className="text-slate-800 p-2 bg-green-100 rounded-md">
                      {result.question.correctTokens.join(" ")}
                    </p>
                  </>
                )}

                <p
                  className={`mt-2 font-bold ${
                    result.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </ReviewModal>
    </>
  );
};
