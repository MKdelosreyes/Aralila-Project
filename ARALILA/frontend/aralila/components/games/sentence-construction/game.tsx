"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Star, Zap, X, RotateCcw } from "lucide-react";
import { ConfirmationModal } from "../confirmation-modal"; // Assuming path
import { SentenceResult } from "./summary";

// --- Interfaces ---
interface Question {
  id: number;
  fragments: string[];
  correctSentence: string;
  translation: string;
}
interface SentenceConstructionGameProps {
  questions: Question[];
  onGameComplete: (summary: {
    score: number;
    results: SentenceResult[];
  }) => void;
  onExit: () => void;
}

const TIME_LIMIT = 180; // 3 minutes
const BASE_POINTS = 15;

type LilaState = "normal" | "happy" | "sad" | "worried";

// --- Dialogue Component ---
const DialogueBubble = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative bg-purple-100 text-purple-800 p-4 rounded-xl shadow-md max-w-xs w-full text-center"
  >
    {children}
    <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-purple-100"></div>
  </motion.div>
);

export const SentenceConstructionGame = ({
  questions,
  onGameComplete,
  onExit,
}: SentenceConstructionGameProps) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [results, setResults] = useState<SentenceResult[]>([]);

  const [draggedFragments, setDraggedFragments] = useState<string[]>([]);
  const [availableFragments, setAvailableFragments] = useState<string[]>([]);

  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [dialogue, setDialogue] = useState<React.ReactNode>("");

  const currentQ = questions[currentQIndex];
  const lilaImage = `/images/character/lila-${lilaState}.png`;

  useEffect(() => {
    if (currentQ) {
      setAvailableFragments(
        [...currentQ.fragments].sort(() => Math.random() - 0.5)
      );
      setDraggedFragments([]);
      setDialogue(
        <>
          Buuin ang mga pinaghalo-halong salita <br />
        </>
      );
    }
  }, [currentQ]);

  const advanceToNext = useCallback(() => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setFeedback(null);
      setLilaState("normal");
    } else {
      onGameComplete({ score, results });
    }
  }, [currentQIndex, questions.length, onGameComplete, score, results]);

  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") {
      setLilaState("worried");
      setDialogue("Oh no, time is running out!");
    }

    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      const finalResults = [...results];
      for (let i = currentQIndex; i < questions.length; i++) {
        finalResults.push({
          question: questions[i],
          userAnswer: "",
          isCorrect: false,
        });
      }
      onGameComplete({ score, results: finalResults });
    }
  }, [
    timeLeft,
    feedback,
    onGameComplete,
    score,
    results,
    currentQIndex,
    questions,
    lilaState,
  ]);

  const checkAnswer = () => {
    if (feedback) return;

    const constructedSentence = draggedFragments.join(" ");
    const isCorrect =
      constructedSentence.toLowerCase() ===
      currentQ.correctSentence.toLowerCase();

    const newResult: SentenceResult = {
      question: currentQ,
      userAnswer: constructedSentence,
      isCorrect,
    };

    if (isCorrect) {
      const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setTimeLeft((prev) => Math.min(prev + 5, TIME_LIMIT));
      setFeedback({ type: "success" });
      setLilaState("happy");
      setDialogue("Great job! You got it right!");
    } else {
      setStreak(0);
      setFeedback({ type: "error" });
      setLilaState("sad");
      setDialogue("Oops, that wasn't quite right.");
    }
    setResults((prev) => [...prev, newResult]);
    setTimeout(advanceToNext, 2500);
  };

  const handleSkip = () => {
    if (feedback) return;
    setStreak(0);
    setFeedback({ type: "skipped" });
    setLilaState("sad");
    setDialogue("That's okay. Let's try the next one!");
    setResults((prev) => [
      ...prev,
      { question: currentQ, userAnswer: "", isCorrect: false },
    ]);
    setTimeout(advanceToNext, 2500);
  };

  const handleFragmentClick = (fragment: string, index: number) => {
    if (feedback) return;
    setAvailableFragments((prev) => prev.filter((_, i) => i !== index));
    setDraggedFragments((prev) => [...prev, fragment]);
  };

  const handleDraggedFragmentClick = (fragment: string, index: number) => {
    if (feedback) return;
    setDraggedFragments((prev) => prev.filter((_, i) => i !== index));
    setAvailableFragments((prev) => [...prev, fragment]);
  };

  const resetFragments = () => {
    setAvailableFragments([...draggedFragments, ...availableFragments]);
    setDraggedFragments([]);
  };

  return (
    <div className="relative z-10 max-w-6xl w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[90vh] w-full">
        {/* Header */}
        <div className="w-full flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <motion.div
              className={`h-4 rounded-full transition-colors duration-500 ${
                timeLeft <= 15
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-purple-500 to-fuchsia-500"
              }`}
              animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          <div className="flex items-center gap-4 text-slate-700">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold">{score}</span>
            </div>
            {streak > 1 && (
              <motion.div
                className="flex items-center gap-1 text-orange-500"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Zap className="w-5 h-5" />
                <span className="text-lg font-bold">{streak}x</span>
              </motion.div>
            )}
          </div>
          <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
            {currentQIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-grow w-full flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Lila Character & Dialogue */}

          <div className="w-full md:w-1/4 flex flex-col items-center justify-start gap-4 order-1 md:order-none">
            <DialogueBubble>{dialogue}</DialogueBubble>
            <AnimatePresence>
              <motion.div
                key={lilaState}
                initial={{ opacity: 0.5, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={lilaImage}
                  alt="Lila character"
                  width={180}
                  height={250}
                  className="drop-shadow-lg"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sentence Construction Area */}
          <div className="w-full md:w-3/4 flex flex-col">
            {/* Answer Drop Area */}
            <div className="w-full bg-slate-100 rounded-2xl p-4 min-h-[160px] border-2 border-dashed border-slate-300 flex flex-wrap gap-3 items-center justify-center mb-4">
              {draggedFragments.length === 0 && (
                <p className="text-slate-400">
                  Click words from the word bank below...
                </p>
              )}
              <AnimatePresence>
                {draggedFragments.map((fragment, index) => (
                  <motion.button
                    key={`${fragment}-${index}-dragged`}
                    layoutId={`${fragment}-${index}`}
                    onClick={() => handleDraggedFragmentClick(fragment, index)}
                    disabled={!!feedback}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg cursor-pointer font-semibold shadow-md"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    {fragment}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Available Fragments */}
            <div className="w-full bg-slate-50 rounded-2xl p-4 min-h-[160px] flex flex-wrap gap-3 items-center justify-center">
              <AnimatePresence>
                {availableFragments.map((fragment, index) => (
                  <motion.button
                    key={`${fragment}-${index}-available`}
                    layoutId={`${fragment}-${index}`}
                    onClick={() => handleFragmentClick(fragment, index)}
                    disabled={!!feedback}
                    className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg cursor-pointer font-semibold hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50"
                  >
                    {fragment}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Reset Button */}
<div className="w-full flex justify-center my-4">
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button
      onClick={resetFragments}
      disabled={!!feedback || draggedFragments.length === 0}
      className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full text-slate-600 font-semibold transition-all transform hover:scale-105 disabled:opacity-40 disabled:pointer-events-none"
    >
      <RotateCcw className="w-5 h-5" />
      Reset
    </button>
  </motion.div>
</div>



            {/* Feedback Area */}
            <div className="flex items-center justify-center h-24">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.type + currentQIndex}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {feedback.type === "success" && (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="text-xl font-bold text-green-600">
                          Correct!
                        </p>
                      </div>
                    )}
                    {feedback.type === "error" && (
                      <div className="flex flex-col items-center gap-1">
                        <XCircle className="w-12 h-12 text-red-500" />
                        <p className="text-lg text-slate-600">
                          Correct Answer:{" "}
                          <span className="font-bold text-purple-700">
                            &quot;{currentQ.correctSentence}&quot;
                          </span>
                        </p>
                      </div>
                    )}
                    {feedback.type === "skipped" && (
                      <div className="flex flex-col items-center gap-1">
                        <XCircle className="w-12 h-12 text-orange-500" />
                        <p className="text-lg text-slate-600">
                          Skipped. The answer was:{" "}
                          <span className="font-bold text-purple-700">
                            &quot;{currentQ.correctSentence}&quot;
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="w-full flex justify-between items-center pt-6 mt-auto border-t border-slate-200">
          <button
            onClick={handleSkip}
            disabled={!!feedback}
            className="px-10 py-4 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-2xl transition-all duration-300 text-lg"
          >
            SKIP
          </button>
          <button
            onClick={checkAnswer}
            disabled={draggedFragments.length === 0 || !!feedback}
            className={`px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform text-lg shadow-lg ${
              draggedFragments.length === 0 || !!feedback
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 hover:scale-105"
            }`}
          >
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};
