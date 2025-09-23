"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, CheckCircle2, XCircle, X, Volume2 } from "lucide-react";
import { SpellingChallengeGameProps } from "@/types/games";
import { SpellingResult } from "./summary";
import { ConfirmationModal } from "../confirmation-modal";
import { LEFT } from "react-swipeable";

const TIME_LIMIT = 120;
const BONUS_TIME = 10;
const BASE_POINTS = 20;
const FALL_SPEED = 0.5;
const LETTER_SPAWN_INTERVAL = 4000;
const CATCHER_WIDTH = 115;
const GAME_AREA_HEIGHT = 400;
const MIN_X_SPACING = 60;

const LETTER_SIZE = 56;
const CATCHER_HEIGHT = 96;
const MAX_ACTIVE_LETTERS = 3;

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

interface FallingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
  // isCorrect: boolean;
  speed: number;
}

export const SpellingChallengeGame = ({
  words,
  onGameComplete,
  onExit,
}: SpellingChallengeGameProps & { onExit: () => void }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [builtWord, setBuiltWord] = useState("");
  const [nextExpectedIndex, setNextExpectedIndex] = useState(0);
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
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [catcherPosition, setCatcherPosition] = useState(GAME_AREA_HEIGHT / 2);
  const [gameWidth, setGameWidth] = useState(0);
  const nextId = useRef<number>(0);
  var gameAreaRef = useRef<HTMLDivElement>(null);

  const happyStates: LilaState[] = ["happy", "thumbsup"];
  const sadStates: LilaState[] = ["sad", "crying"];
  const currentWordData = words[currentWordIndex];

  const getRandomLetter = () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26));

  useEffect(() => {
    if (feedback) return;

    const spawnOnce = () => {
      setFallingLetters((prev) => {
        // optional cap per tick:
        if (prev.length >= MAX_ACTIVE_LETTERS) return prev;

        const width = gameAreaRef.current?.clientWidth ?? 800;
        const expected = currentWordData.word[builtWord.length]?.toUpperCase();
        const chooseCorrect = !!expected && Math.random() < 0.7;
        const rand = getRandomLetter();
        const letterVal = (chooseCorrect ? expected : rand).toUpperCase();

        let newX = Math.random() * Math.max(0, width - LETTER_SIZE);
        let attempts = 0;
        while (
          prev.some((l) => Math.abs(l.x - newX) < MIN_X_SPACING) &&
          attempts < 10
        ) {
          newX = Math.random() * Math.max(0, width - LETTER_SIZE);
          attempts++;
        }

        return [
          ...prev,
          {
            id: nextId.current++,
            letter: letterVal,
            x: newX,
            y: 0,
            speed: FALL_SPEED + Math.random() * 0.3,
          } as FallingLetter,
        ];
      });
    };

    // first spawn after commit (helps with StrictMode duplicates)
    const rafId = requestAnimationFrame(spawnOnce);
    const spawnInterval = setInterval(spawnOnce, LETTER_SPAWN_INTERVAL);

    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(rafId);
    };
  }, [currentWordData.word, builtWord.length, feedback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gameArea = document.getElementById("mainGameArea");
      const gameWidth = gameArea?.offsetWidth || 730;

      var fullWidth = 0;
      if (gameArea) {
        fullWidth = gameArea.getBoundingClientRect().width;
      }
      setGameWidth(fullWidth / 2);

      // console.log("Game width: ", gameWidth);
      if (e.key === "ArrowLeft") {
        setCatcherPosition((prev) => Math.max(CATCHER_WIDTH / 2, prev - 20));
      } else if (e.key === "ArrowRight") {
        setCatcherPosition((prev) =>
          Math.min(fullWidth / 2 - (CATCHER_WIDTH / 2 + 5), prev + 20)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Timer logic
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

  // Advance to next word
  const advanceToNext = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setBuiltWord("");
      setNextExpectedIndex(0);
      setFallingLetters([]);
      setFeedback(null);
      setLilaState("normal");
      setAnimationKey((prev) => prev + 1);
    } else {
      onGameComplete({ score, results });
    }
  }, [currentWordIndex, words.length, onGameComplete, score, results]);

  // Submit answer when word is complete
  const submitAnswer = useCallback(
    (userWord: string) => {
      if (feedback) return; // guard against double calls

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
        setLilaState(
          happyStates[Math.floor(Math.random() * happyStates.length)]
        );
      } else {
        setStreak(0);
        setFeedback({ type: "error" });
        setLilaState(sadStates[Math.floor(Math.random() * sadStates.length)]);
      }

      setResults((prev) => [...prev, newResult]);

      // After showing feedback, reset states and advance
      setTimeout(() => {
        setFallingLetters([]);
        setBuiltWord("");
        setNextExpectedIndex(0);
        setCatcherPosition((gameAreaRef.current?.clientWidth ?? 800) / 2);
        setFeedback(null);
        setLilaState("normal");
        advanceToNext();
      }, 2500);
    },
    [feedback, currentWordData, streak, advanceToNext, happyStates, sadStates]
  );

  const handleCatch = useCallback(
    (caughtLetter: string) => {
      setBuiltWord((prevBuiltWord) => {
        const newBuiltWord = prevBuiltWord + caughtLetter;

        // Check if word is complete
        if (newBuiltWord.length === currentWordData.word.length) {
          // Use setTimeout to ensure the state update has been processed
          setTimeout(() => {
            submitAnswer(newBuiltWord);
          }, 0);
        }

        console.log("Caught letter:", caughtLetter, " -> built:", newBuiltWord);
        return newBuiltWord;
      });

      setNextExpectedIndex((prev) => prev + 1);
    },
    [currentWordData.word.length, submitAnswer]
  );

  // Game loop
  useEffect(() => {
    if (feedback || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setFallingLetters((prev) => {
        const catcherTop = GAME_AREA_HEIGHT - CATCHER_HEIGHT;
        const catcherLeft = catcherPosition - CATCHER_WIDTH / 2;
        const catcherRight = catcherLeft + CATCHER_WIDTH;

        const moved = prev.map((l) => ({ ...l, y: l.y + l.speed }));
        const kept: FallingLetter[] = [];
        let caughtLetter: string | null = null;

        for (const l of moved) {
          const letterBottom = l.y + LETTER_SIZE;
          const letterCenterX = l.x + LETTER_SIZE / 2;

          const overlappingY =
            letterBottom >= catcherTop && l.y <= catcherTop + CATCHER_HEIGHT;
          const withinX =
            letterCenterX >= catcherLeft && letterCenterX <= catcherRight;
          const isCaught = overlappingY && withinX;

          if (isCaught && !caughtLetter) {
            // capture the first caught letter this tick
            caughtLetter = l.letter;
            // do not add to kept (removes it)
          } else if (l.y < GAME_AREA_HEIGHT) {
            kept.push(l);
          }
        }

        // Handle the caught letter outside of the state updater
        if (caughtLetter) {
          handleCatch(caughtLetter);
        }

        return kept;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [feedback, timeLeft, catcherPosition, handleCatch]);

  // Skip word
  const handleSkip = () => {
    if (feedback) return;
    setStreak(0);
    setFeedback({ type: "skipped" });
    setLilaState("sad");
    setResults((prev) => [
      ...prev,
      { wordData: currentWordData, userAnswer: "", isCorrect: false },
    ]);

    setTimeout(() => {
      setFallingLetters([]);
      setBuiltWord("");
      setNextExpectedIndex(0);
      setCatcherPosition((gameAreaRef.current?.clientWidth ?? 800) / 2);
      advanceToNext();
    }, 2500);
  };

  // Listen to word
  const handleListen = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentWordData.word);
      utterance.lang = "fil-PH";
      window.speechSynthesis.speak(utterance);
    } else {
      alert(
        "Paumanhin, hindi sinusuportahan ng iyong browser ang tampok na pakikinig."
      );
    }
  };

  const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="z-10 max-w-[950px] w-full mx-auto p-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col w-full">
        <div className="w-full flex items-center gap-4 mb-2">
          <button
            onClick={onExit}
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
        <div
          id="mainGameArea"
          className="flex-grow w-full flex flex-col items-center justify-center mb-4 px-15"
        >
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
            <div className="flex flex-row gap-6 items-center">
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col items-center md:items-start gap-4"
              >
                <div className="relative bg-purple-50 border border-purple-200 p-4 rounded-xl shadow-md max-w-sm text-center md:text-left">
                  <p className="text-lg text-slate-800">
                    {currentWordData.hint}
                  </p>
                </div>
              </motion.div>
              <button
                onClick={handleListen}
                className="flex items-center gap-2 px-4 py-3 bg-purple-100/80 hover:bg-purple-200/80 border border-purple-200 rounded-full text-purple-700 font-semibold transition-all transform hover:scale-105"
              >
                <Volume2 className="w-5 h-5" />
                {/* Listen */}
              </button>
            </div>

            <div className="text-2xl font-bold text-purple-800 self-end tracking-widest">
              {currentWordData.word
                .split("")
                .map((char, idx) =>
                  idx < builtWord.length ? (
                    <span key={idx}>{builtWord[idx]}</span>
                  ) : (
                    <span key={idx}>_</span>
                  )
                )}
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            id="gameArea"
            className="relative w-full h-[400px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl overflow-hidden border-4 border-dashed border-purple-200"
          >
            <AnimatePresence>
              {fallingLetters.map(({ id, letter, x, y }) => (
                <motion.div
                  key={id}
                  className="absolute flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-md text-3xl font-bold text-purple-700 border-2 border-purple-400"
                  style={{ left: x, top: y }}
                  animate={{ y }}
                  transition={{ duration: 2 }}
                >
                  {letter}
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.div
              className="absolute bottom-0 h-24 rounded-t-2xl flex items-center justify-center text-white font-bold"
              style={{
                width: CATCHER_WIDTH,
                left: catcherPosition - CATCHER_WIDTH / 2,
                backgroundImage: `url(${lilaImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
              }}
              animate={{ x: catcherPosition - CATCHER_WIDTH / 2 }}
            ></motion.div>
          </div>
        </div>

        {/* Feedback */}
        <div className="flex items-center justify-center h-24 my-4 absolute">
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

        {/* Buttons */}
        <div className="w-full flex justify-between items-center pt-5 border-t border-slate-200">
          <button
            onClick={handleSkip}
            disabled={!!feedback}
            className="px-7 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-2xl transition-all duration-300 text-base"
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
};
