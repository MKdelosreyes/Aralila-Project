"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Star, Zap, X } from "lucide-react";
import { ConfirmationModal } from "../confirmation-modal";

export interface WordAssociationQuestion {
  images: string[];
  answer: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface WordAssociationResult {
  questionData: WordAssociationQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

interface GameProps {
  questions: WordAssociationQuestion[];
  onGameComplete: (summary: {
    score: number;
    results: WordAssociationResult[];
  }) => void;
  onExit: () => void;
}

const TIME_LIMIT = 90;
const BASE_POINTS = 100;
const BONUS_TIME = 5;

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

type LilaState = "normal" | "happy" | "sad" | "worried" | "thumbsup";

export const WordAssociationGame = ({
  questions,
  onGameComplete,
  onExit,
}: GameProps) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<
    WordAssociationQuestion[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [results, setResults] = useState<WordAssociationResult[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [animationKey, setAnimationKey] = useState(0);
  // New state for dynamic dialogue
  const [dialogue, setDialogue] = useState("Let's find the common word!");

  const currentQuestion = shuffledQuestions[currentIndex];
  const happyStates: LilaState[] = ["happy", "thumbsup"];
  // const sadStates: LilaState[] = ["sad"];

  useEffect(() => {
    setShuffledQuestions(shuffleArray(questions).slice(0, 10));
  }, [questions]);

  // Set initial dialogue to the question's hint
  useEffect(() => {
    if (currentQuestion) {
      setUserLetters(Array(currentQuestion.answer.length).fill(""));
      setDialogue(currentQuestion.hint);
      setTimeout(() => document.getElementById("letter-0")?.focus(), 100);
    }
  }, [currentQuestion]);

  const handleEndGame = useCallback(() => {
    const finalResults = [...results];
    for (let i = currentIndex; i < shuffledQuestions.length; i++) {
      finalResults.push({
        questionData: shuffledQuestions[i],
        userAnswer: "",
        isCorrect: false,
      });
    }
    onGameComplete({ score, results: finalResults });
  }, [score, results, currentIndex, shuffledQuestions, onGameComplete]);

  // Updated timer logic with dialogue change
  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") {
      setLilaState("worried");
      setDialogue("Uh oh, the clock is ticking!");
    }

    if (timeLeft <= 0) {
      handleEndGame();
    }

    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, feedback, handleEndGame, lilaState]);

  const advanceToNext = useCallback(() => {
    if (currentIndex + 1 >= shuffledQuestions.length) {
      handleEndGame();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setFeedback(null);
      setLilaState("normal");
      setAnimationKey((prev) => prev + 1);
    }
  }, [currentIndex, shuffledQuestions.length, handleEndGame]);

  // Updated answer processing with dialogue changes
  const processAnswer = (
    userWord: string,
    isCorrect: boolean,
    isSkipped = false
  ) => {
    const newResult: WordAssociationResult = {
      questionData: currentQuestion,
      userAnswer: userWord,
      isCorrect,
    };

    if (isSkipped) {
      setStreak(0);
      setFeedback({ type: "skipped" });
      setLilaState("sad");
      setDialogue("No problem, let's try the next one.");
    } else if (isCorrect) {
      const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setFeedback({ type: "success" });
      setLilaState(happyStates[Math.floor(Math.random() * happyStates.length)]);
      setDialogue("You got it! Great job!");
      setTimeLeft((prev) => Math.min(prev + BONUS_TIME, TIME_LIMIT));
    } else {
      setStreak(0);
      setFeedback({ type: "error" });
      setLilaState("sad");
      setDialogue("Oops, that's not quite right.");
    }
    setResults((prev) => [...prev, newResult]);
    setTimeout(advanceToNext, 2000);
  };

  const handleSubmit = () => {
    if (feedback) return;
    const userWord = userLetters.join("");
    const isCorrect =
      userWord.toLowerCase() === currentQuestion.answer.toLowerCase();
    processAnswer(userWord, isCorrect);
  };

  const handleSkip = () => {
    if (feedback) return;
    processAnswer("", false, true);
  };

  const updateLetter = (index: number, letter: string) => {
    if (/^[a-zA-Z]$/.test(letter) || letter === "") {
      const newLetters = [...userLetters];
      newLetters[index] = letter.toUpperCase();
      setUserLetters(newLetters);
      if (letter && index < currentQuestion.answer.length - 1) {
        document.getElementById(`letter-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && userLetters.every((l) => l)) handleSubmit();
    else if (e.key === "Backspace" && !userLetters[index] && index > 0) {
      document.getElementById(`letter-${index - 1}`)?.focus();
    }
  };

  if (!currentQuestion) return <div>Loading...</div>;

  const lilaImage = `/images/character/lila-${lilaState}.png`;
  const boxSize =
    currentQuestion.answer.length <= 6
      ? "w-14 h-14 text-2xl"
      : currentQuestion.answer.length <= 9
      ? "w-11 h-11 text-xl"
      : "w-9 h-9 text-lg";

  return (
    <div className="relative z-10 max-w-7xl w-full mx-auto">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 flex flex-col w-full">
        {/* Header */}
        <div className="w-full flex items-center gap-4 mb-4 flex-shrink-0">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100"
          >
            <X />
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
              <Star className="text-yellow-400" />
              <span className="text-xl font-bold">{score}</span>
            </div>
            {streak > 1 && (
              <motion.div
                className="flex items-center gap-1 text-orange-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Zap />
                <span className="text-lg font-bold">{streak}x</span>
              </motion.div>
            )}
          </div>
          <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
            {currentIndex + 1} / {shuffledQuestions.length}
          </div>
        </div>

        {/* Main Content Area:*/}
        <div className="flex-grow w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 py-2">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center gap-4 order-2 lg:order-1"
          >
            <div className="relative bg-purple-50 border border-purple-200 p-3 rounded-xl shadow-md max-w-[200px] text-center">
              <p className="text-md text-slate-800">{dialogue}</p>

              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-purple-50"></div>
            </div>
            <motion.div
              key={lilaState}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <Image
                src={lilaImage}
                alt="Lila"
                width={150}
                height={150}
                priority
              />
            </motion.div>
          </motion.div>

          <div className="flex flex-col items-center justify-center w-full max-w-lg order-1 lg:order-2">
            <div className="w-full grid grid-cols-2 gap-2 mb-4">
              {currentQuestion.images.map((src, idx) => (
                <div
                  key={idx}
                  className="w-full aspect-square rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm"
                >
                  <Image
                    src={src}
                    alt={`Clue ${idx + 1}`}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 flex-nowrap w-full px-2 py-2 overflow-x-auto">
              {currentQuestion.answer.split("").map((_, index) => (
                <input
                  key={index}
                  id={`letter-${index}`}
                  type="text"
                  maxLength={1}
                  value={userLetters[index] || ""}
                  onChange={(e) => updateLetter(index, e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, index)}
                  className={`${boxSize} font-bold text-center text-slate-800 rounded-lg bg-slate-100 border-2 border-slate-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300 flex-shrink-0`}
                  autoFocus={index === 0}
                  disabled={!!feedback}
                />
              ))}
            </div>

            {/* 3. Feedback Area */}
            <div className="flex items-center justify-center h-16 mt-2">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.type + currentIndex}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {feedback.type === "success" && (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="w-9 h-9 text-green-500" />
                        <p className="text-md font-bold text-green-600">
                          Correct!
                        </p>
                      </div>
                    )}
                    {(feedback.type === "error" ||
                      feedback.type === "skipped") && (
                      <div className="flex flex-col items-center gap-1">
                        <XCircle
                          className={`w-9 h-9 ${
                            feedback.type === "error"
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        />
                        <p className="text-sm text-slate-600">
                          Answer:{" "}
                          <span className="font-bold text-purple-700">
                            {currentQuestion.answer}
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
        <div className="w-full flex justify-between items-center pt-4 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={handleSkip}
            disabled={!!feedback}
            className="px-8 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 font-bold rounded-xl transition-all text-lg"
          >
            SKIP
          </button>
          <button
            onClick={handleSubmit}
            disabled={userLetters.some((l) => !l) || !!feedback}
            className={`px-8 py-3 text-white font-bold rounded-xl transition-all transform text-lg shadow-lg ${
              userLetters.some((l) => !l) || !!feedback
                ? "bg-gray-400 cursor-not-allowed shadow-none"
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
