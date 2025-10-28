"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Zap, Volume2, HandHelping } from "lucide-react";
import { ConfirmationModal } from "../confirmation-modal";

// Constants
const TIME_LIMIT = 120;
const BONUS_TIME = 10;
const BASE_POINTS = 20;
const FALL_SPEED = 1.2;
const LETTER_SPAWN_INTERVAL = 2500;
const CATCHER_WIDTH = 115;
const GAME_AREA_HEIGHT = 400;
const MIN_X_SPACING = 100;
const LETTER_SIZE = 56;
const CATCHER_HEIGHT = 96;
const MAX_ACTIVE_LETTERS = 3;
const CORRECT_LETTER_PROBABILITY = 0.8;
const MAX_ASSISTS = 3;

// Move these outside component to prevent recreation on every render
const HAPPY_STATES: LilaState[] = ["happy", "thumbsup"];
const SAD_STATES: LilaState[] = ["sad", "crying"];

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

interface FallingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
  speed: number;
}

interface SpellingResult {
  wordData: {
    word: string;
    hint: string;
  };
  userAnswer: string;
  isCorrect: boolean;
}

interface SpellingChallengeGameProps {
  words: Array<{
    word: string;
    hint: string;
  }>;
  onGameComplete: (results: {
    score: number;
    results: SpellingResult[];
  }) => void;
  onExit: () => void;
}

export const SpellingChallengeGame = ({
  words,
  onGameComplete,
  onExit,
}: SpellingChallengeGameProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [builtWord, setBuiltWord] = useState("");
  const [results, setResults] = useState<SpellingResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [catcherPosition, setCatcherPosition] = useState(GAME_AREA_HEIGHT / 2);
  const [gameWidth, setGameWidth] = useState(800);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Assists system
  const [assists, setAssists] = useState(MAX_ASSISTS);
  const [showAssistAnimation, setShowAssistAnimation] = useState(false);

  const nextId = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const currentWordData = words[currentWordIndex];

  const getRandomLetter = () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26));

  // Initialize and update game width
  useEffect(() => {
    const updateWidth = () => {
      if (gameAreaRef.current) {
        setGameWidth(gameAreaRef.current.clientWidth);
        setCatcherPosition(gameAreaRef.current.clientWidth / 2);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handle assist usage
  const handleUseAssist = () => {
    if (
      assists <= 0 ||
      feedback ||
      builtWord.length >= currentWordData.word.length
    )
      return;

    // Get the next correct letter
    const nextCorrectLetter =
      currentWordData.word[builtWord.length].toUpperCase();

    // Add the letter to built word
    setBuiltWord((prev) => prev + nextCorrectLetter);

    // Decrease assists
    setAssists((prev) => prev - 1);

    // Show animation
    setShowAssistAnimation(true);
    setTimeout(() => setShowAssistAnimation(false), 1000);

    // Clear falling letters to respawn with new target
    setFallingLetters([]);

    // Check if word is complete after assist
    const newBuiltWord = builtWord + nextCorrectLetter;
    if (newBuiltWord.length === currentWordData.word.length) {
      requestAnimationFrame(() => {
        submitAnswer(newBuiltWord);
      });
    }
  };

  // Spawn falling letters
  useEffect(() => {
    if (feedback) return;

    const spawnOnce = () => {
      setFallingLetters((prev) => {
        if (prev.length >= MAX_ACTIVE_LETTERS) return prev;

        const expected = currentWordData.word[builtWord.length]?.toUpperCase();
        const chooseCorrect =
          !!expected && Math.random() < CORRECT_LETTER_PROBABILITY;
        const rand = getRandomLetter();
        const letterVal = (chooseCorrect ? expected : rand).toUpperCase();

        let newX = Math.random() * Math.max(0, gameWidth - LETTER_SIZE);
        let attempts = 0;
        while (
          prev.some((l) => Math.abs(l.x - newX) < MIN_X_SPACING) &&
          attempts < 10
        ) {
          newX = Math.random() * Math.max(0, gameWidth - LETTER_SIZE);
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

    const rafId = requestAnimationFrame(spawnOnce);
    const spawnInterval = setInterval(spawnOnce, LETTER_SPAWN_INTERVAL);

    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(rafId);
    };
  }, [currentWordData.word, builtWord.length, feedback, gameWidth]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCatcherPosition((prev) => Math.max(CATCHER_WIDTH / 2, prev - 20));
      } else if (e.key === "ArrowRight") {
        setCatcherPosition((prev) =>
          Math.min(gameWidth - CATCHER_WIDTH / 2, prev + 20)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameWidth]);

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
      if (feedback) return;

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
          HAPPY_STATES[Math.floor(Math.random() * HAPPY_STATES.length)]
        );
      } else {
        setStreak(0);
        setFeedback({ type: "error" });
        setLilaState(SAD_STATES[Math.floor(Math.random() * SAD_STATES.length)]);
      }

      setResults((prev) => [...prev, newResult]);

      setTimeout(() => {
        setFallingLetters([]);
        setBuiltWord("");
        setCatcherPosition(gameWidth / 2);
        setFeedback(null);
        setLilaState("normal");
        advanceToNext();
      }, 2500);
    },
    [feedback, currentWordData, streak, advanceToNext, gameWidth]
  );

  const handleCatch = useCallback(
    (caughtLetter: string) => {
      const newBuiltWord = builtWord + caughtLetter;
      setBuiltWord(newBuiltWord);

      if (newBuiltWord.length === currentWordData.word.length) {
        requestAnimationFrame(() => {
          submitAnswer(newBuiltWord);
        });
      }

      console.log("Caught letter:", caughtLetter, " -> built:", newBuiltWord);
    },
    [builtWord, currentWordData.word.length, submitAnswer]
  );

  // Game loop with requestAnimationFrame
  useEffect(() => {
    if (feedback || timeLeft <= 0) return;

    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 16) {
        lastTime = currentTime;

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
              caughtLetter = l.letter;
            } else if (l.y < GAME_AREA_HEIGHT) {
              kept.push(l);
            }
          }

          if (caughtLetter) {
            handleCatch(caughtLetter);
          }

          return kept;
        });
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
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
      setCatcherPosition(gameWidth / 2);
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
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
        title={"Lumabas sa Laro?"}
        description="Sigurado ka ba na gusto mong umalis? Hindi mase-save ang iyong score."
      />
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col w-full">
        <div className="w-full flex items-center gap-4 mb-2">
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
                <span className="text-lg font-bold">x{streak}</span>
              </motion.div>
            )}
            {/* Assists counter */}
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <HandHelping className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {assists}
              </span>
            </div>
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
                  <p className="text-purple-800 font-semibold text-lg">
                    {currentWordData.hint}
                  </p>
                </div>
              </motion.div>
              <button
                onClick={handleListen}
                className="flex items-center gap-2 px-4 py-3 bg-purple-100/80 hover:bg-purple-200/80 border border-purple-200 rounded-full text-purple-700 font-semibold transition-all transform hover:scale-105"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-2xl font-bold text-purple-800 self-end tracking-widest">
              {currentWordData.word
                .split("")
                .map((char, idx) =>
                  idx < builtWord.length ? (
                    <motion.span
                      key={idx}
                      initial={
                        showAssistAnimation && idx === builtWord.length - 1
                          ? { scale: 0, color: "#10b981" }
                          : {}
                      }
                      animate={
                        showAssistAnimation && idx === builtWord.length - 1
                          ? { scale: [1.5, 1], color: ["#10b981", "#6b21a8"] }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      {builtWord[idx]}
                    </motion.span>
                  ) : (
                    <span key={idx}>_</span>
                  )
                )
                .reduce((prev, curr, idx) => (
                  <>
                    {prev}
                    {idx > 0 && " "}
                    {curr}
                  </>
                ))}
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
                  className="absolute bg-gradient-to-br from-purple-400 to-fuchsia-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center text-2xl"
                  style={{
                    width: LETTER_SIZE,
                    height: LETTER_SIZE,
                    left: x,
                    top: y,
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  {letter}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Assist Animation Overlay */}
            <AnimatePresence>
              {showAssistAnimation && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-6xl font-bold text-green-500"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: [1, 1.5, 1], rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    {currentWordData.word[builtWord.length - 1]?.toUpperCase()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback Overlay */}
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.type + currentWordIndex}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4"
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: -20 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    {feedback.type === "success" && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-4xl">✓</span>
                        </div>
                        <div className="text-green-600 font-bold text-2xl">
                          Tama!
                        </div>
                        <div className="text-green-700 text-lg">
                          +{streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS} puntos
                        </div>
                      </div>
                    )}
                    {feedback.type === "error" && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-4xl">✗</span>
                        </div>
                        <div className="text-red-600 font-bold text-2xl">
                          Mali!
                        </div>
                        <div className="text-red-700 text-lg">
                          Ang tamang sagot:{" "}
                          <span className="font-bold">
                            {currentWordData.word}
                          </span>
                        </div>
                      </div>
                    )}
                    {feedback.type === "skipped" && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-4xl">⊘</span>
                        </div>
                        <div className="text-orange-600 font-bold text-2xl">
                          Nilaktawan!
                        </div>
                        <div className="text-orange-700 text-lg">
                          Ang sagot:{" "}
                          <span className="font-bold">
                            {currentWordData.word}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
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
            />
          </div>
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

          <button
            onClick={handleUseAssist}
            disabled={
              assists <= 0 ||
              !!feedback ||
              builtWord.length >= currentWordData.word.length
            }
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none"
          >
            <HandHelping className="w-5 h-5" />
            <span>Gamitin Assist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
