"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Star, Zap, X } from "lucide-react";
import { PunctuationData, PunctuationResult } from "@/types/games"; // Use your types
import { PUNCTUATION_MARKS } from "@/data/games/punctuation-task";
import { ConfirmationModal } from "../confirmation-modal"; // Adjust path as needed

// --- Helper Types & Constants ---
const TIME_LIMIT = 120; // 2 minutes
const BASE_POINTS = 20;
const TIME_BONUS = 5; // seconds added for correct answer

type LilaState = "normal" | "happy" | "sad" | "worried";
type GameFeedback = "success" | "error" | "skipped" | null;

// --- Helper Function to Prepare Sentence ---
// This function inserts placeholder objects only where punctuation is needed.
const parseSentence = (
  sentence: string,
  correctPunctuation: { position: number; mark: string }[]
) => {
  const words = sentence.split(" ");
  const elements: (string | { type: "placeholder"; position: number })[] = [];
  const placeholderPositions = new Set(
    correctPunctuation.map((p) => p.position)
  );

  // let wordIndex = 0;
  for (let i = 0; i < words.length; i++) {
    elements.push(words[i]);
    // A "position" corresponds to the space *after* a word.
    if (placeholderPositions.has(i)) {
      elements.push({ type: "placeholder", position: i });
    }
  }
  return elements;
};

// --- Reusable UI Components from your example ---
const DialogueBubble = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative bg-purple-100 text-purple-800 p-4 rounded-xl shadow-md min-w-[250px] w-full text-center"
  >
    {children}
    <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-purple-100"></div>
  </motion.div>
);

// --- Main Game Component ---
export const PunctuationChallengeGame = ({
  sentences,
  onGameComplete,
  onExit,
}: {
  sentences: PunctuationData[];
  onGameComplete: (data: {
    score: number;
    results: PunctuationResult[];
  }) => void;
  onExit: () => void;
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [results, setResults] = useState<PunctuationResult[]>([]);
  const [placedAnswers, setPlacedAnswers] = useState<{ [key: number]: string }>(
    {}
  );
  // const [selectedPunctuation, setSelectedPunctuation] = useState<string | null>(
  //   null
  // );

  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [feedback, setFeedback] = useState<GameFeedback>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [dialogue, setDialogue] = useState<React.ReactNode>(
    "Piliin ang tamang bantas at ilagay sa puwang."
  );

  const currentSentenceData = sentences[currentQIndex];
  const lilaImage = `/images/character/lila-${lilaState}.png`;

  // Memoize the parsed sentence to avoid recalculating on every render
  const parsedSentence = useMemo(() => {
    if (!currentSentenceData) return [];
    return parseSentence(
      currentSentenceData.sentence,
      currentSentenceData.correctPunctuation
    );
  }, [currentSentenceData]);

  // Reset state for new question
  useEffect(() => {
    setPlacedAnswers({});
    setSelectedPunctuation(null);
    setDialogue("Piliin ang tamang bantas at ilagay sa puwang.");
  }, [currentQIndex]);

  const advanceToNext = useCallback(() => {
    if (currentQIndex < sentences.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setFeedback(null);
      setLilaState("normal");
    } else {
      onGameComplete({ score, results });
    }
  }, [currentQIndex, sentences.length, onGameComplete, score, results]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") {
      setLilaState("worried");
      setDialogue("Naku, paubos na ang oras!");
    }
    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      // Auto-submit whatever is there and end the game
      onGameComplete({ score, results });
    }
  }, [timeLeft, feedback, onGameComplete, score, results, lilaState]);

  const handlePunctuationSelect = (mark: string) => {
    if (feedback) return;

    // Find the first empty placeholder position
    const correctPositions = currentSentenceData.correctPunctuation.map(
      (p) => p.position
    );
    const firstEmptyPosition = correctPositions.find(
      (pos) => !placedAnswers[pos]
    );

    // If there's an empty position, place the punctuation there immediately
    if (firstEmptyPosition !== undefined) {
      setPlacedAnswers((prev) => ({ ...prev, [firstEmptyPosition]: mark }));
    }
  };

  const handlePlaceholderClick = (position: number) => {
    if (feedback) return;

    // If this position has punctuation, remove it (send it back to choices)
    if (placedAnswers[position]) {
      const newAnswers = { ...placedAnswers };
      delete newAnswers[position];
      setPlacedAnswers(newAnswers);
    }
  };

  const checkAnswer = () => {
    if (feedback) return;

    const userAnswerAsArray = Object.entries(placedAnswers)
      .map(([pos, mk]) => ({
        position: Number(pos),
        mark: mk,
      }))
      .sort((a, b) => a.position - b.position);

    const correctAnswerAsArray = [
      ...currentSentenceData.correctPunctuation,
    ].sort((a, b) => a.position - b.position);
    const isCorrect =
      JSON.stringify(userAnswerAsArray) ===
      JSON.stringify(correctAnswerAsArray);

    const newResult: PunctuationResult = {
      sentenceData: currentSentenceData,
      userAnswer: userAnswerAsArray,
      isCorrect,
    };

    if (isCorrect) {
      const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setTimeLeft((prev) => Math.min(prev + TIME_BONUS, TIME_LIMIT));
      setFeedback("success");
      setLilaState("happy");
      setDialogue("Magaling! Tama ang sagot mo!");
    } else {
      setStreak(0);
      setFeedback("error");
      setLilaState("sad");
      setDialogue("Ay, hindi iyan ang tamang sagot.");
    }

    setResults((prev) => [...prev, newResult]);
    setTimeout(advanceToNext, 2500);
  };

  const handleSkip = () => {
    // Logic for skipping (same as your example)
    if (feedback) return;
    setStreak(0);
    setFeedback("skipped");
    setLilaState("sad");
    setDialogue("Sige lang. Subukan natin ang susunod!");
    setResults((prev) => [
      ...prev,
      { sentenceData: currentSentenceData, userAnswer: [], isCorrect: false },
    ]);
    setTimeout(advanceToNext, 2500);
  };

  // Check if a punctuation mark is currently placed in any box
  const isPunctuationPlaced = (mark: string) => {
    return Object.values(placedAnswers).includes(mark);
  };

  return (
    <div className="relative z-10 max-w-6xl w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
        title={"Lumabas sa Laro?"}
        description="Sigurado ka ba na gusto mong umalis? Hindi mase-save ang iyong score."
      />
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[90vh] w-full">
        {/* Header */}
        <div className="w-full flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="p-2 text-slate-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-100"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <motion.div
              className={`h-4 rounded-full ${
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
            {currentQIndex + 1} / {sentences.length}
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

          {/* Punctuation Area */}
          <div className="w-full md:w-3/4 flex flex-col items-center">
            {/* Sentence Display Area - Fixed font consistency */}
            <div className="w-full bg-slate-100 rounded-2xl p-6 min-h-[160px] flex flex-wrap gap-x-2 gap-y-4 items-center justify-center mb-4 text-3xl md:text-4xl text-slate-800 leading-relaxed">
              {parsedSentence.map((el, index) => {
                if (typeof el === "string") {
                  return (
                    <span key={index} className="font-sans">
                      {el}
                    </span>
                  );
                }
                // It's a placeholder
                return (
                  <button
                    key={index}
                    onClick={() => handlePlaceholderClick(el.position)}
                    disabled={!!feedback}
                    className={`w-12 h-12 md:w-16 md:h-16 inline-flex items-center justify-center rounded-lg border-2 border-dashed transition-colors font-sans
                      ${
                        placedAnswers[el.position]
                          ? "border-purple-500 bg-purple-200 text-purple-700 font-bold hover:bg-red-100 hover:border-red-500 cursor-pointer"
                          : "border-slate-400 bg-white"
                      }
                    `}
                  >
                    {placedAnswers[el.position] || ""}
                  </button>
                );
              })}
            </div>

            {/* Punctuation Bank */}
            <div className="w-full bg-slate-50 rounded-2xl p-4 min-h-[100px] flex flex-wrap gap-3 items-center justify-center">
              {PUNCTUATION_MARKS.map((mark) => (
                <button
                  key={mark}
                  onClick={() => handlePunctuationSelect(mark)}
                  disabled={!!feedback || isPunctuationPlaced(mark)}
                  className={`w-14 h-14 text-2xl font-bold rounded-lg transition-all duration-200 shadow-sm
                    ${
                      isPunctuationPlaced(mark)
                        ? "bg-gray-300 text-gray-500 border-2 border-gray-400 cursor-not-allowed"
                        : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-purple-50 hover:border-purple-400 hover:scale-105"
                    }
                  `}
                >
                  {mark}
                </button>
              ))}
            </div>

            {/* Feedback Area */}
            <div className="flex items-center justify-center h-24 mt-4">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback + currentQIndex}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {feedback === "success" && (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="text-xl font-bold text-green-600">
                          Tama!
                        </p>
                      </div>
                    )}
                    {feedback === "error" && (
                      <div className="flex flex-col items-center gap-1">
                        <XCircle className="w-12 h-12 text-red-500" />
                        <p className="text-lg text-slate-600">
                          Tamang Sagot:{" "}
                          <span className="font-bold text-purple-700">
                            &quot;
                            {currentSentenceData.correctPunctuation
                              .map((p) => p.mark)
                              .join(" ")}
                            &quot;
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
            className="px-7 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 font-bold rounded-2xl text-base"
          >
            SKIP
          </button>
          <button
            onClick={checkAnswer}
            disabled={Object.keys(placedAnswers).length === 0 || !!feedback}
            className={`px-7 py-2 text-white font-bold rounded-2xl transition-all duration-300 text-base shadow-lg ${
              Object.keys(placedAnswers).length === 0 || !!feedback
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:scale-105"
            }`}
          >
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};
