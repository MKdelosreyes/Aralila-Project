"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Star, Zap, X } from "lucide-react";
import { ConfirmationModal } from "../confirmation-modal";
import { GrammarResult } from "./summary";

interface GrammarError {
  word: string;
  errorType: string;
  explanation: string;
  correct: string;
}
interface Question {
  id: number;
  sentence: string;
  errors: GrammarError[];
}
interface GrammarCheckGameProps {
  questions: Question[];
  onGameComplete: (summary: { score: number; results: GrammarResult[] }) => void;
  onExit: () => void;
}

const TIME_LIMIT = 120;
const BASE_POINTS = 20;
type LilaState = "normal" | "happy" | "sad" | "worried" | "crying";

export const GrammarCheckGame = ({ questions, onGameComplete, onExit }: GrammarCheckGameProps) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [results, setResults] = useState<GrammarResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "skipped" } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [lilaState, setLilaState] = useState<LilaState>("normal");

  const currentQ = questions[currentQIndex];

  const advanceToNext = useCallback(() => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedErrors([]);
      setFeedback(null);
      setLilaState("normal");
      setAnimationKey((prev) => prev + 1);
    } else {
      onGameComplete({ score, results });
    }
  }, [currentQIndex, questions.length, onGameComplete, score, results]);

  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") setLilaState("worried");

    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      const finalResults = [...results];
      for (let i = currentQIndex; i < questions.length; i++) {
        finalResults.push({ question: questions[i], userAnswer: [], isCorrect: false });
      }
      onGameComplete({ score, results: finalResults });
    }
  }, [timeLeft, feedback, onGameComplete, score, results, currentQIndex, questions, lilaState]);

const checkAnswer = () => {
  if (feedback) return;

  const correctErrorWords = new Set(currentQ.errors.map((e) => e.word));
  const selectedWords = new Set(
    selectedErrors.includes("NO_ERROR") ? [] : selectedErrors.map((key) => key.split("-")[0])
  );

  let isCorrect = false;

  if (selectedErrors.includes("NO_ERROR")) {
    isCorrect = currentQ.errors.length === 0;
  } else {
    isCorrect =
      selectedWords.size === correctErrorWords.size &&
      [...selectedWords].every((word) => correctErrorWords.has(word));
  }

  const newResult: GrammarResult = {
    question: currentQ,
    userAnswer: Array.from(selectedWords),
    isCorrect,
  };

  if (isCorrect) {
    const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
    setScore((prev) => prev + points);
    setStreak((prev) => prev + 1);
    setFeedback({ type: "success" });
    setLilaState("happy");

    // ✅ Add extra time (capped at TIME_LIMIT)
    setTimeLeft((prev) => Math.min(prev + 10, TIME_LIMIT));
  } else {
    setStreak(0);
    setFeedback({ type: "error" });
    setLilaState("sad");
  }

  setResults((prev) => [...prev, newResult]);
  setTimeout(advanceToNext, 2500);
};


  const handleSkip = () => {
    if (feedback) return;
    setStreak(0);
    setFeedback({ type: "skipped" });
    setLilaState("sad");
    setResults((prev) => [...prev, { question: currentQ, userAnswer: [], isCorrect: false }]);
    setTimeout(advanceToNext, 2500);
  };

  const handleWordClick = (token: string, index: number) => {
    if (feedback) return;
    const wordKey = `${token}-${index}`;
    setSelectedErrors((prev) =>
      prev.includes(wordKey) ? prev.filter((k) => k !== wordKey) : [...prev.filter(k => k !== "NO_ERROR"), wordKey]
    );
  };

const renderSentence = () => {
  if (!currentQ) return null;
  const tokens = currentQ.sentence.match(/(\w+'?\w*|[.,!?;:"'])/g) || [];

  return tokens.map((token, index) => {
    const wordKey = `${token}-${index}`;
    const isSelected = selectedErrors.includes(wordKey);
    const isCorrectError =
      feedback && currentQ.errors.some((e) => e.word === token);
    const isWronglySelected =
      feedback && isSelected && !currentQ.errors.some((e) => e.word === token);

    return (
      <span key={index} className="inline-block">
        <button
          onClick={() => handleWordClick(token, index)}
          disabled={!!feedback}
          className={`inline-block cursor-pointer rounded-xl px-3 py-1 mx-0.5 font-medium text-xl leading-relaxed border transition-all duration-300 transform
            ${
              isSelected
                ? "bg-purple-300 text-purple-900 border-purple-600 ring-4 ring-purple-400 shadow-lg scale-110"
                : "bg-white text-slate-800 border-slate-300 hover:bg-purple-100 hover:scale-105 hover:shadow-md"
            }
            ${isCorrectError ? "bg-green-200 line-through" : ""}
            ${isWronglySelected ? "bg-red-200" : ""}
            ${feedback ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          {token}
        </button>
      </span>
    );
  });
};


  const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="relative z-10 max-w-[950px] w-full mx-auto p-4">
      <ConfirmationModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} onConfirm={onExit} />
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        <div className="w-full flex items-center gap-4 mb-8">
          <button onClick={() => setIsExitModalOpen(true)} className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100">
            <X className="w-6 h-6" />
          </button>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <motion.div
              className={`h-4 rounded-full transition-colors duration-500 ${timeLeft <= 15 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-fuchsia-500"}`}
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
              <motion.div className="flex items-center gap-1 text-orange-500" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Zap className="w-5 h-5" />
                <span className="text-lg font-bold">{streak}x</span>
              </motion.div>
            )}
          </div>
          <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
            {currentQIndex + 1} / {questions.length}
          </div>
        </div>

        <div className="flex-grow w-full flex flex-col items-center justify-center">
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <motion.div className="relative" key={lilaState} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <Image src={lilaImage} alt="Lila" width={150} height={150} priority />
            </motion.div>
            <motion.div key={animationKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="flex flex-col items-center md:items-start gap-4">
              <div className="relative bg-purple-50 border border-purple-200 p-4 rounded-xl shadow-md max-w-sm text-center md:text-left">
                <p className="text-lg text-slate-800">Suriin ang pangungusap at tukuyin ang mga mali.</p>
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-purple-50 hidden md:block"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-purple-50 md:hidden"></div>
              </div>
            </motion.div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl w-full text-center">
            {renderSentence()}
<div className="mt-10 ">
 <button
    onClick={() =>
      setSelectedErrors((prev) =>
        prev.includes("NO_ERROR") ? [] : ["NO_ERROR"]
      )
    }
    disabled={!!feedback}
    className={`w-full sm:w-auto inline-block text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform
      ${
        selectedErrors.includes("NO_ERROR")
          ? "bg-purple-500 shadow-lg shadow-purple-700/60 scale-105 ring-4 ring-purple-300"
          : "bg-purple-600 hover:bg-purple-700 hover:scale-105 shadow-lg shadow-purple-500/30"
      }
      ${!!feedback ? "opacity-50 pointer-events-none" : ""}
    `}
  >
    Walang Mali
  </button>
</div>


          </div>
        </div>

        <div className="flex items-center justify-center h-24 my-4">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div key={feedback.type + currentQIndex} className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {feedback.type === "success" && (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <p className="text-xl font-bold text-green-600">Tama!</p>
                  </div>
                )}
                {feedback.type === "error" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-red-500" />
                    <p className="text-lg text-slate-600">
                      Ang tamang sagot: <span className="font-bold text-purple-700">{currentQ.errors.map((e) => e.word).join(", ") || "Walang Mali"}</span>
                    </p>
                  </div>
                )}
                {feedback.type === "skipped" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-orange-500" />
                    <p className="text-lg text-slate-600">
                      Na-skip. Mali ay: <span className="font-bold text-purple-700">{currentQ.errors.map((e) => e.word).join(", ") || "Walang Mali"}</span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full flex justify-between items-center pt-6 border-t border-slate-200">
          <button onClick={handleSkip} disabled={!!feedback} className="px-10 py-4 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-2xl transition-all duration-300 text-lg">
            SKIP
          </button>
          <button
            onClick={checkAnswer}
            disabled={selectedErrors.length === 0 || !!feedback}
            className={`px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform text-lg shadow-lg
              ${selectedErrors.length === 0 || !!feedback
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 hover:scale-105"}`}
          >
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};
