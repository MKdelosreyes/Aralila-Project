"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, CheckCircle2, XCircle, X, Volume2 } from "lucide-react";
import { SpellingChallengeGameProps } from "@/types/games";
import { SpellingResult } from "./summary";
import { ConfirmationModal } from "../confirmation-modal";

const TIME_LIMIT = 120;
const BONUS_TIME = 10;
const BASE_POINTS = 20;

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

export const SpellingChallengeGame = ({
  words,
  onGameComplete,
  onExit,
}: SpellingChallengeGameProps & { onExit: () => void }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [results, setResults] = useState<SpellingResult[]>([]);

  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [lilaState, setLilaState] = useState<LilaState>("normal");

  const happyStates: LilaState[] = ["happy", "thumbsup"];
  const sadStates: LilaState[] = ["sad", "crying"];
  const currentWordData = words[currentWordIndex];

  // Handler functions
  const advanceToNext = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setUserLetters([]);
      setFeedback(null);
      setLilaState("normal");
      setAnimationKey((prev) => prev + 1);
      setTimeout(() => document.getElementById("letter-0")?.focus(), 100);
    } else {
      onGameComplete({ score, results });
    }
  }, [currentWordIndex, words.length, onGameComplete, score, results]);

  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") setLilaState("worried");
    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      const finalResults = [...results];
      for (let i = currentWordIndex; i < words.length; i++) {
        finalResults.push({
          wordData: words[i],
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
    currentWordIndex,
    words,
    lilaState,
  ]);

  const submitAnswer = () => {
    if (feedback) return;
    const userWord = userLetters.join("");
    const correctWord = currentWordData.word;
    const isCorrect = userWord === correctWord;
    const newResult: SpellingResult = {
      wordData: currentWordData,
      userAnswer: userWord,
      isCorrect,
    };

    if (isCorrect) {
      const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setTimeLeft((prev) => Math.min(prev + BONUS_TIME, TIME_LIMIT));
      setFeedback({ type: "success" });
      setLilaState(happyStates[Math.floor(Math.random() * happyStates.length)]);
    } else {
      setStreak(0);
      setFeedback({ type: "error" });
      setLilaState(sadStates[Math.floor(Math.random() * sadStates.length)]);
    }
    setResults((prev) => [...prev, newResult]);
    setTimeout(advanceToNext, 2500);
  };

  const handleSkip = () => {
    if (feedback) return;
    setStreak(0);
    setFeedback({ type: "skipped" });
    setLilaState("sad");
    setResults((prev) => [
      ...prev,
      { wordData: currentWordData, userAnswer: "", isCorrect: false },
    ]);
    setTimeout(advanceToNext, 2500);
  };

  const updateLetter = (index: number, letter: string) => {
    const newLetters = [...userLetters];
    newLetters[index] = letter.toUpperCase();
    setUserLetters(newLetters);
    if (letter && index < currentWordData.word.length - 1) {
      document.getElementById(`letter-${index + 1}`)?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (userLetters.filter((l) => l).length === currentWordData.word.length) {
        submitAnswer();
      }
    } else if (e.key === "Backspace" && !userLetters[index] && index > 0) {
      document.getElementById(`letter-${index - 1}`)?.focus();
    }
  };

  // not accurate english
  const handleListen = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentWordData.word);
      utterance.lang = "fil-PH"; // or use "tl-PH" if "fil-PH" doesn't work
      window.speechSynthesis.speak(utterance);
    } else {
      alert(
        "Paumanhin, hindi sinusuportahan ng iyong browser ang tampok na pakikinig."
      );
    }
  };

  const boxSize =
    currentWordData.word.length <= 5
      ? "w-16 h-16 text-3xl"
      : currentWordData.word.length <= 8
      ? "w-14 h-14 text-2xl"
      : "w-12 h-12 text-xl";

  const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="relative z-10 max-w-[950px] w-full mx-auto p-4">

      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        <div className="w-full flex items-center gap-4 mb-8">
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
            {currentWordIndex + 1} / {words.length}
          </div>
        </div>

        {/* Main Game */}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <motion.div
              className="relative"
              key={lilaState}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Image
                src={lilaImage}
                alt="Lila"
                width={150}
                height={150}
                priority
              />
            </motion.div>
            <motion.div
              key={animationKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center md:items-start gap-4"
            >
              <div className="relative bg-purple-50 border border-purple-200 p-4 rounded-xl shadow-md max-w-sm text-center md:text-left">
                <p className="text-lg text-slate-800">{currentWordData.hint}</p>
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-purple-50 hidden md:block"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-purple-50 md:hidden"></div>
              </div>
              <button
                onClick={handleListen}
                className="flex items-center gap-2 px-5 py-2 bg-purple-100/80 hover:bg-purple-200/80 border border-purple-200 rounded-full text-purple-700 font-semibold transition-all transform hover:scale-105"
              >
                <Volume2 className="w-5 h-5" />
                Listen
              </button>
            </motion.div>
          </div>
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap w-full max-w-5xl mx-auto px-4 py-4 overflow-visible">
            {currentWordData.word.split("").map((_, index) => (
              <input
                key={index}
                id={`letter-${index}`}
                type="text"
                maxLength={1}
                value={userLetters[index] || ""}
                onChange={(e) => updateLetter(index, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, index)}
                className={`${boxSize} font-bold text-center text-slate-800 rounded-2xl bg-slate-100 border-2 border-slate-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300 flex-shrink-0`}
                autoFocus={index === 0}
                disabled={!!feedback}
              />
            ))}
          </div>
        </div>

        {/* correct/wrong feedback */}
        <div className="flex items-center justify-center h-24 my-4">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.type + currentWordIndex}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {feedback.type === "success" && (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <p className="text-xl font-bold text-green-600">Correct!</p>
                  </div>
                )}
                {feedback.type === "error" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-red-500" />
                    <p className="text-lg text-slate-600">
                      Answer:{" "}
                      <span className="font-bold text-purple-700">
                        {currentWordData.word}
                      </span>
                    </p>
                  </div>
                )}
                {feedback.type === "skipped" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-orange-500" />
                    <p className="text-lg text-slate-600">
                      Skipped:{" "}
                      <span className="font-bold text-purple-700">
                        {currentWordData.word}
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* buttons */}
        <div className="w-full flex justify-between items-center pt-6 border-t border-slate-200">
          <button
            onClick={handleSkip}
            disabled={!!feedback}
            className="px-10 py-4 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-2xl transition-all duration-300 text-lg"
          >
            SKIP
          </button>
          <button
            onClick={submitAnswer}
            disabled={
              userLetters.filter((l) => l).length !==
                currentWordData.word.length || !!feedback
            }
            className={`px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform text-lg shadow-lg
    ${
      userLetters.filter((l) => l).length !== currentWordData.word.length ||
      !!feedback
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
