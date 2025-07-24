"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, CheckCircle2, XCircle, X, Volume2 } from "lucide-react"; // Removed Shuffle import
import { ConfirmationModal } from "../confirmation-modal";
const TIME_LIMIT = 180; // 3 minutes for matching activity
const BONUS_TIME = 15;
const BASE_POINTS = 30;

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

interface WordPair {
  id: string;
  word: string;
  definition: string;
  category?: string;
}

interface MatchingResult {
  wordPair: WordPair;
  selectedDefinition: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface WordMatchingGameProps {
  wordPairs: WordPair[];
  onGameComplete: (results: { score: number; results: MatchingResult[] }) => void;
  onExit: () => void;
}

export const WordMatchingGame = ({
  wordPairs,
  onGameComplete,
  onExit,
}: WordMatchingGameProps) => {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selectedDefinition, setSelectedDefinition] = useState<string>("");
  const [results, setResults] = useState<MatchingResult[]>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]);

  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [lilaState, setLilaState] = useState<LilaState>("normal");

  const happyStates: LilaState[] = ["happy", "thumbsup"];
  const sadStates: LilaState[] = ["sad", "crying"];
  const currentWordPair = wordPairs[currentPairIndex];

  // Prepare definitions for current word (no shuffling)
  useEffect(() => {
    if (currentWordPair) {
      const allDefinitions = wordPairs.map(pair => pair.definition);
      const correctDefinition = currentWordPair.definition;
      const otherDefinitions = allDefinitions.filter(def => def !== correctDefinition);

      // Take 3 random wrong definitions + 1 correct = 4 options
      const wrongDefinitions = otherDefinitions
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [correctDefinition, ...wrongDefinitions]
        .sort(() => Math.random() - 0.5); // Still randomize presentation order

      setShuffledDefinitions(options);
      setSelectedDefinition("");
      setStartTime(Date.now());
    }
  }, [currentPairIndex, wordPairs, currentWordPair]);

  // Handler functions
  const advanceToNext = useCallback(() => {
    if (currentPairIndex < wordPairs.length - 1) {
      setCurrentPairIndex((prev) => prev + 1);
      setSelectedDefinition("");
      setFeedback(null);
      setLilaState("normal");
      setAnimationKey((prev) => prev + 1);
    } else {
      onGameComplete({ score, results });
    }
  }, [currentPairIndex, wordPairs.length, onGameComplete, score, results]);

  useEffect(() => {
    if (timeLeft <= 30 && lilaState === "normal") setLilaState("worried");
    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      const finalResults = [...results];
      for (let i = currentPairIndex; i < wordPairs.length; i++) {
        finalResults.push({
          wordPair: wordPairs[i],
          selectedDefinition: "",
          isCorrect: false,
          timeSpent: 0,
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
    currentPairIndex,
    wordPairs,
    lilaState,
  ]);

  const submitAnswer = () => {
    if (feedback || !selectedDefinition) return;

    const isCorrect = selectedDefinition === currentWordPair.definition;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    const newResult: MatchingResult = {
      wordPair: currentWordPair,
      selectedDefinition,
      isCorrect,
      timeSpent,
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
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    setResults((prev) => [
      ...prev,
      {
        wordPair: currentWordPair,
        selectedDefinition: "",
        isCorrect: false,
        timeSpent
      },
    ]);
    setTimeout(advanceToNext, 2500);
  };

  const handleListen = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentWordPair.word);
      utterance.lang = "fil-PH";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support the speech feature.");
    }
  };

  // Removed shuffleOptions function

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
                timeLeft <= 30
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
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Zap className="w-5 h-5" />
                <span className="text-lg font-bold">{streak}x</span>
              </motion.div>
            )}
          </div>
          <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
            {currentPairIndex + 1} / {wordPairs.length}
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
              <div className="relative bg-purple-50 border border-purple-200 p-6 rounded-xl shadow-md max-w-sm text-center md:text-left">
                <p className="text-sm text-slate-600 mb-2">Match this word:</p>
                <p className="text-2xl font-bold text-purple-700 mb-2">{currentWordPair?.word}</p>
                <p className="text-lg text-slate-800">Choose the correct definition below</p>
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-purple-50 hidden md:block"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-purple-50 md:hidden"></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleListen}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100/80 hover:bg-purple-200/80 border border-purple-200 rounded-full text-purple-700 font-semibold transition-all transform hover:scale-105"
                >
                  <Volume2 className="w-4 h-4" />
                  Listen
                </button>
                {/* Removed Shuffle button */}
              </div>
            </motion.div>
          </div>

          {/* Definition Options */}
          <div className="w-full max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shuffledDefinitions.map((definition, index) => (
                <motion.button
                  key={`${definition}-${animationKey}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  onClick={() => !feedback && setSelectedDefinition(definition)}
                  disabled={!!feedback}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedDefinition === definition
                      ? "bg-purple-100 border-purple-400 text-purple-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  } ${feedback ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0 mt-1">
                      {String.fromCharCode(65 + index)}
                    </div> */}
                    <p className="text-sm leading-relaxed">{definition}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="flex items-center justify-center h-24 my-4">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.type + currentPairIndex}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {feedback.type === "success" && (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <p className="text-xl font-bold text-green-600">Perfect Match!</p>
                  </div>
                )}
                {feedback.type === "error" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-red-500" />
                    <p className="text-lg text-slate-600 text-center max-w-md">
                      Correct:{" "}
                      <span className="font-bold text-purple-700 block mt-1">
                        {currentWordPair?.definition}
                      </span>
                    </p>
                  </div>
                )}
                {feedback.type === "skipped" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-orange-500" />
                    <p className="text-lg text-slate-600 text-center max-w-md">
                      Skipped:{" "}
                      <span className="font-bold text-purple-700 block mt-1">
                        {currentWordPair?.definition}
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons */}
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
            disabled={!selectedDefinition || !!feedback}
            className={`px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform text-lg shadow-lg
              ${
                !selectedDefinition || !!feedback
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 hover:scale-105"
              }`}
          >
            MATCH
          </button>
        </div>
      </div>
    </div>
  );
};