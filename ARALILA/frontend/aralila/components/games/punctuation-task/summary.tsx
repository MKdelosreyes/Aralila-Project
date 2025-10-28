"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Target, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { PunctuationResult } from "@/types/games";
import { splitIntoWords } from "@/data/games/punctuation-task";

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
  onRestart?: () => void;
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
  onRestart,
}: SummaryProps) => {
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
          alt="Lila character expressing emotion based on score"
          width={150}
          height={150}
          className="mx-auto mb-4"
          priority
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
            onClick={onRestart}
            className="w-full sm:w-auto inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            CONTINUE
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-block bg-transparent hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-xl border-2 border-slate-300 transition-all duration-300"
          >
            REVIEW ANSWERS
          </button>
        </div>
      </motion.div>

      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="overflow-y-auto pr-2 -mr-2">
          <div className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-xl border flex items-start gap-4 ${
                  result.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  className={`mt-1 flex-shrink-0 ${
                    result.isCorrect ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {result.isCorrect ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <XCircle size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-800 mb-2">
                    {buildCorrectSentence(result)}
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                      Your Answer:{" "}
                      <span className="font-bold">
                        {result.userAnswer.length > 0
                          ? result.userAnswer.map((a) => `${a.mark}`).join(", ")
                          : "No Answer"}
                      </span>
                    </p>
                    {!result.isCorrect && (
                      <p className="text-sm text-red-700 bg-red-100 px-3 py-1.5 rounded-md">
                        Correct Answer:{" "}
                        <span className="font-bold">
                          {result.sentenceData.correctPunctuation
                            .map((p) => p.mark)
                            .join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                  {/* <div className="mt-2 text-xs text-slate-500">
                    Completed: {result.gapsCompleted} /{" "}
                    {result.sentenceData.correctPunctuation.length}
                  </div> */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ReviewModal>
    </>
  );
};
