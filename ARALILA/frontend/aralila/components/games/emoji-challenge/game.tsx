"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Zap, X, ArrowRight } from "lucide-react";
import { ConfirmationModal } from "../confirmation-modal";
import { emojiSentenceAPI } from "@/lib/api/emojiSentenceConstruction";

// --- Interfaces ---
interface Question {
  id: number;
  emojis: string[];
  keywords: string[];
  translation: string;
}
interface GameResult {
  questionData: Question;
  isCorrect: boolean;
  userAnswer: string;
  pointsEarned: number;
}
interface GameProps {
  questions: Question[];
  difficulty?: number;
  onGameComplete: (summary: {
    percentScore: number;
    rawPoints: number;
    results: GameResult[];
    timeTaken: number;
  }) => void;
  onExit: () => void;
}

// --- Constants ---
const TIME_LIMIT = 300; // 3 minutes total
const BONUS_TIME = 5; // +5 seconds for a correct answer
const MAX_MISTAKES = 6;

type LilaState =
  | "normal"
  | "happy"
  | "sad"
  | "worried"
  | "crying"
  | "thumbsup"
  | "thinking";
type GameStatus = "playing" | "failed" | "completed" | "skipped" | "reviewed";

// --- Main Game Component ---
export const EmojiHulaSalitaGame = ({
  questions,
  difficulty = 1,
  onGameComplete,
  onExit,
}: GameProps) => {
  const [shuffledQuestions] = useState(() =>
    [...questions].sort(() => Math.random() - 0.5)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [studentAnswer, setStudentAnswer] = useState("");
  const [mistakes, setMistakes] = useState(0);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [results, setResults] = useState<GameResult[]>([]);
  const [gameStartTime] = useState<number>(Date.now());

  const [lilaState, setLilaState] = useState<LilaState>("thinking");
  const [dialogue, setDialogue] = useState(".....");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const currentQuestion = useMemo(
    () => shuffledQuestions[currentQuestionIndex],
    [shuffledQuestions, currentQuestionIndex]
  );

  // Setup for the new question
  useEffect(() => {
    if (!currentQuestion) return;
    setStudentAnswer("");
    setMistakes(0);
    setStatus("playing");
    setShowNextButton(false);

    if (currentQuestionIndex === 0) {
      setLilaState("thinking");
    } else if (lilaState === "sad" || lilaState === "crying") {
      setLilaState("worried");
    } else {
      setLilaState("normal");
    }

    setDialogue(
      "Ang kahulugan nito sa englis ay: '" + currentQuestion.translation + "'"
    );
  }, [currentQuestion, currentQuestionIndex]);

  // --- Timer Logic ---
  useEffect(() => {
    if (status !== "playing" || isCheckingAnswer) return;

    if (timeLeft <= 0) {
      const correctCount = results.filter((r) => r.isCorrect).length;
      const totalEarnedPoints = results.reduce(
        (sum, r) => sum + r.pointsEarned,
        0
      );
      const totalPossiblePoints = results.length * 20;
      const percentScore =
        totalPossiblePoints > 0
          ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100)
          : 0;
      const timeTaken = (Date.now() - gameStartTime) / 1000;

      onGameComplete({
        percentScore,
        rawPoints: score,
        results,
        timeTaken,
      });
      return;
    }

    if (
      timeLeft <= 15 &&
      lilaState !== "worried" &&
      lilaState !== "sad" &&
      lilaState !== "crying"
    ) {
      setLilaState("worried");
      setDialogue("Naku, paubos na ang oras! 😥");
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [
    timeLeft,
    status,
    isCheckingAnswer,
    onGameComplete,
    score,
    results,
    lilaState,
  ]);

  // --- Handle Next Question ---
  const handleNext = () => {
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      const totalEarnedPoints = results.reduce(
        (sum, r) => sum + r.pointsEarned,
        0
      );
      const totalPossiblePoints = results.length * 20;
      const percentScore =
        totalPossiblePoints > 0
          ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100)
          : 0;
      const timeTaken = (Date.now() - gameStartTime) / 1000;

      onGameComplete({
        percentScore,
        rawPoints: score,
        results,
        timeTaken,
      });
    } else {
      setStudentAnswer("");
      setCurrentQuestionIndex((prev) => prev + 1);
      setStatus("playing");
      setShowNextButton(false);
      setLilaState("normal");
    }
  };

  // --- Main Guessing Logic ---
  const handleSubmitAnswer = async () => {
    if (status !== "playing" || !studentAnswer.trim() || isCheckingAnswer)
      return;

    setIsCheckingAnswer(true);
    setDialogue("Sinusuri ko ang iyong sagot...");

    try {
      const result = await emojiSentenceAPI.checkAnswer(
        studentAnswer,
        currentQuestion.keywords
      );

      if (result.error) {
        throw new Error(result.error);
      }

      const pointsEarned = result.points || (result.valid ? 20 : 0);
      const basePoints = pointsEarned;
      const streakBonus = streak >= 3 ? Math.floor(basePoints * 0.25) : 0;
      const totalPoints = basePoints + streakBonus;

      const newResult: GameResult = {
        questionData: currentQuestion,
        isCorrect: result.valid,
        userAnswer: studentAnswer.trim(),
        pointsEarned: totalPoints,
      };

      const updatedResults = [...results, newResult];

      if (result.valid) {
        // Correct
        setStatus("completed");
        const newScore = score + totalPoints;
        setScore(newScore);
        setStreak((prev) => prev + 1);
        setTimeLeft((prev) => Math.min(prev + BONUS_TIME, TIME_LIMIT));

        setResults(updatedResults);

        // Use AI feedback and append score
        const bonusText =
          streakBonus > 0
            ? ` (${pointsEarned} base + ${streakBonus} streak bonus)`
            : "";
        const aiFeedback = result.explanation || "Tama ang sagot!";
        setDialogue(
          `${aiFeedback}\n\n Puntos: ${totalPoints} points${bonusText}`
        );
        setLilaState(
          pointsEarned === 20
            ? Math.random() > 0.5
              ? "happy"
              : "thumbsup"
            : "happy"
        );

        setIsCheckingAnswer(false);
        setShowNextButton(true);
      } else {
        // Incorrect
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setLilaState("sad");
        setStreak(0);

        let newScore = score;
        if (pointsEarned > 0) {
          newScore = score + pointsEarned;
          setScore(newScore);
        }

        const aiFeedback = result.explanation || "Hindi tama ang sagot.";
        setDialogue(
          `${aiFeedback}\n\n Puntos: ${
            pointsEarned > 0 ? `${pointsEarned}` : "0"
          } points`
        );

        setResults(updatedResults);
        setIsCheckingAnswer(false);
        setShowNextButton(true);

        if (newMistakes >= MAX_MISTAKES) {
          setStatus("failed");
          setLilaState("crying");
          setDialogue("Maraming mali. Subukan muli!");
        }
      }
    } catch (err: any) {
      console.error("Error checking answer:", err);

      let errorMessage = "Nagkaroon ng error. Subukan muli.";

      if (err.response?.status === 429) {
        errorMessage = "Masyadong maraming request. Sandali lang...";
        setLilaState("worried");
      } else if (err.response?.status === 408) {
        errorMessage = "Timeout. Subukan ulit!";
        setLilaState("worried");
      } else if (err.message) {
        errorMessage = err.message;
        setLilaState("sad");
      }

      setDialogue(errorMessage);

      if (err.response?.status === 429) {
        setTimeout(() => {
          setDialogue("Subukan mo ulit ngayon!");
          setLilaState("normal");
          setIsCheckingAnswer(false);
        }, 3000);
      } else {
        setIsCheckingAnswer(false);
      }
    }
  };

  const handleSkip = () => {
    if (status !== "playing" || isCheckingAnswer) return;

    setStatus("skipped");
    setLilaState("sad");
    setDialogue(
      "Okay lang 'yan. Eto ang susunod. \n\n Nakuha mo: 0 points (skipped)"
    );
    setStreak(0);

    const skippedResult: GameResult = {
      questionData: currentQuestion,
      isCorrect: false,
      userAnswer: "(skipped)",
      pointsEarned: 0,
    };

    const updatedResults = [...results, skippedResult];
    setResults(updatedResults);
    setShowNextButton(true);
  };
  if (!currentQuestion) return <div>Nagloloading...</div>;

  const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="relative z-10 max-w-5xl w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[90vh] w-full">
        {/* Header */}
        <div className="w-full flex items-center gap-4 mb-4">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
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
          <div className="flex items-center justify-end gap-4 text-slate-700">
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
            {currentQuestionIndex + 1} / {shuffledQuestions.length}
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-grow w-full flex flex-col items-center justify-center gap-2 px-15">
          {/* Lila and Content Container */}
          <div className="w-full flex flex-row items-stretch gap-6 mb-6">
            {/* Lila Character */}
            <div className="flex items-center justify-center">
              <motion.div
                key={lilaState}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Image
                  src={lilaImage}
                  alt="Lila"
                  width={180}
                  height={180}
                  priority
                />
              </motion.div>
            </div>

            {/* Dialogue and Emojis Container */}
            <div className="flex-1 flex flex-col justify-between gap-4 min-h-[180px]">
              {/* Dialogue */}
              <motion.div
                key={dialogue}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-purple-50 border border-purple-200 rounded-xl shadow-md py-3 flex items-center justify-center"
              >
                <p className="text-base text-slate-800 text-center px-4 whitespace-pre-line">
                  {dialogue}
                </p>
                {/* Speech bubble pointer */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-purple-200"></div>
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-purple-50"></div>
              </motion.div>

              {/* Emojis */}
              <div className="flex justify-center items-center w-full">
                <div className="bg-gradient-to-br from-yellow-50 to-purple-50 rounded-2xl shadow-lg px-8 py-6 flex gap-4 border-4 border-dashed border-purple-300 w-full items-center justify-center">
                  {currentQuestion.emojis.map((emoji, index) => (
                    <motion.div
                      key={index}
                      className="text-5xl md:text-6xl"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text Answer Input */}
          <div className="w-full">
            <div className="w-full bg-gradient-to-br from-purple-50 to-white border-4 border-dashed border-purple-400 rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                I-type ang buong pangungusap:
              </label>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Isulat dito ang iyong sagot..."
                disabled={status !== "playing"}
                className="w-full min-h-[90px] bg-white border border-purple-200 rounded-xl p-4 outline-none resize-none text-lg font-mono text-purple-800 placeholder:text-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                style={{
                  fontFamily: `'Fira Mono', 'JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full flex justify-between items-center pt-6 mt-auto border-t border-slate-200">
          <button
            onClick={handleSkip}
            disabled={
              status !== "playing" || isCheckingAnswer || showNextButton
            }
            className="px-7 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 font-bold rounded-2xl text-base transition-all"
          >
            SKIP
          </button>

          {showNextButton ? (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleNext}
              className="px-7 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-bold text-base transition-all flex items-center gap-2 min-w-[180px] justify-center shadow-lg"
            >
              <span>
                {currentQuestionIndex === shuffledQuestions.length - 1
                  ? "Finish"
                  : "Next"}
              </span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              onClick={handleSubmitAnswer}
              disabled={
                status !== "playing" ||
                isCheckingAnswer ||
                !studentAnswer.trim()
              }
              className="px-7 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-base transition disabled:opacity-50 flex items-center gap-2 min-w-[180px] justify-center"
            >
              {isCheckingAnswer ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Checking...</span>
                </>
              ) : (
                "Submit Answer"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
