"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
// --- NEW: Imported RefreshCcw for the shuffle button ---
import { Star, Zap, CheckCircle2, XCircle, X, Volume2, RefreshCcw } from "lucide-react";
import { SpellingChallengeGameProps, SpellingWord } from "@/types/games";
import { SpellingResult } from "./summary";
import { ConfirmationModal } from "../confirmation-modal";

const TIME_LIMIT = 120;
const BONUS_TIME = 5;
const BASE_POINTS = 20;

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const SpellingChallengeGame = ({
  words,
  onGameComplete,
  onExit,
}: SpellingChallengeGameProps & { onExit: () => void }) => {
  const [shuffledWords, setShuffledWords] = useState<SpellingWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<{ char: string; optionId: number }[]>([]);
  const [letterOptions, setLetterOptions] = useState<{ char: string; id: number }[]>([]);
  const [dialogue, setDialogue] = useState("");
  
  const [results, setResults] = useState<SpellingResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  
  const happyStates: LilaState[] = ["happy", "thumbsup"];
  const sadStates: LilaState[] = ["sad", "crying"];
  
  const currentWordData = useMemo(() => shuffledWords[currentWordIndex], [shuffledWords, currentWordIndex]);

  useEffect(() => {
    setShuffledWords(shuffleArray(words));
  }, [words]);
  
  //  Function to create a jumbled array that is not the original word
  const createNonMatchingJumble = useCallback((word: string) => {
    const uniqueChars = new Set(word.split(""));
    if (uniqueChars.size === 1 && word.length > 1) {
       return word.split("").map((char, index) => ({ char, id: index }));
    }

    let jumbledChars;
    let jumbledWord = "";

    do {
      jumbledChars = shuffleArray(word.split(""));
      jumbledWord = jumbledChars.join("");
    } while (jumbledWord === word && word.length > 1);

    return jumbledChars.map((char, index) => ({
      char,
      id: index,
    }));
  }, []);

  const setupNewWord = useCallback((wordData: SpellingWord | undefined) => {
    if (!wordData) return;
    

    const jumbled = createNonMatchingJumble(wordData.word);
    
    setLetterOptions(jumbled);
    setUserAnswer([]);
    setFeedback(null);
    setLilaState("normal");
    setDialogue(wordData.hint);
  }, [createNonMatchingJumble]);

  useEffect(() => {
    if (shuffledWords.length > 0) {
      setupNewWord(shuffledWords[0]);
    }
  }, [shuffledWords, setupNewWord]);


  const advanceToNext = useCallback(() => {
    if (currentWordIndex < shuffledWords.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setupNewWord(shuffledWords[nextIndex]);
    } else {
      onGameComplete({ score, results });
    }
  }, [currentWordIndex, shuffledWords, onGameComplete, score, results, setupNewWord]);

  useEffect(() => {
    if (!currentWordData || feedback) return;

    if (timeLeft === 0) {
      const finalResults = [...results];
      for (let i = currentWordIndex; i < shuffledWords.length; i++) {
        finalResults.push({
          wordData: shuffledWords[i],
          userAnswer: "",
          isCorrect: false,
        });
      }
      onGameComplete({ score, results: finalResults });
      return;
    }

    if (timeLeft <= 15 && lilaState === "normal") {
      setLilaState("worried");
      setDialogue("Uh oh, the clock is ticking!");
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, feedback, onGameComplete, score, results, currentWordIndex, shuffledWords, lilaState, currentWordData]);

  const submitAnswer = () => {
    if (feedback) return;

    const userAnswerWord = userAnswer.map((item) => item.char).join("");
    const isCorrect = userAnswerWord === currentWordData.word;
    const newResult: SpellingResult = {
      wordData: currentWordData,
      userAnswer: userAnswerWord,
      isCorrect,
    };

    if (isCorrect) {
      const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setTimeLeft((prev) => Math.min(prev + BONUS_TIME, TIME_LIMIT));
      setFeedback({ type: "success" });
      setLilaState(happyStates[Math.floor(Math.random() * happyStates.length)]);
      setDialogue("You got it! Great job! ✨");
    } else {
      setStreak(0);
      setFeedback({ type: "error" });
      setLilaState(sadStates[Math.floor(Math.random() * sadStates.length)]);
      setDialogue("Oops, that's not quite right.");
    }
    setResults((prev) => [...prev, newResult]);
    setTimeout(advanceToNext, 2500);
  };

  const handleSkip = () => {
    if (feedback) return;
    const newResult: SpellingResult = {
        wordData: currentWordData,
        userAnswer: "",
        isCorrect: false,
    };
    
    setStreak(0);
    setFeedback({ type: "skipped" });
    setLilaState("sad");
    setDialogue("No problem, let's try the next one.");
    setResults((prev) => [...prev, newResult]);
    setTimeout(advanceToNext, 2500);
  };
  
  const handleSelectLetter = (char: string, optionId: number) => {
    if (userAnswer.length >= currentWordData.word.length) return;
    setUserAnswer(prev => [...prev, { char, optionId }]);
  };

  const handleDeselectLetter = (indexToRemove: number) => {
    setUserAnswer(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- NEW: Handler for the shuffle button ---
  const handleShuffleLetters = () => {
    if (feedback) return;
    setUserAnswer([]); // Reset current answer
    setLetterOptions(createNonMatchingJumble(currentWordData.word));
  }
  
  const handleListen = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentWordData.word);
      utterance.lang = "fil-PH"; // Tagalog (Philippines)
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Paumanhin, hindi sinusuportahan ng iyong browser ang tampok na pakikinig.");
    }
  };

  const usedOptionIds = useMemo(() => new Set(userAnswer.map(a => a.optionId)), [userAnswer]);
  
  if (!currentWordData) {
    return <div className="text-center p-8">Loading game...</div>;
  }

  const boxSize =
    currentWordData.word.length <= 5
      ? "w-20 h-20 text-4xl"
      : currentWordData.word.length <= 8
      ? "w-16 h-16 text-3xl"
      : "w-14 h-14 text-2xl";

  const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="relative z-10 max-w-[950px] w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[75vh] w-full">
        {/* Top Bar (Header) */}
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
                        timeLeft <= 15 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-fuchsia-500"
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
                {currentWordIndex + 1} / {shuffledWords.length}
            </div>
        </div>
        
        {/* Main Game Area */}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                <motion.div
                    className="relative"
                    key={lilaState}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    <Image src={lilaImage} alt="Lila" width={150} height={150} priority />
                </motion.div>
                <motion.div
                    key={dialogue}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex flex-col items-center md:items-start gap-4"
                >
                    <div className="relative bg-purple-50 border border-purple-200 p-4 rounded-xl shadow-md max-w-sm text-center md:text-left">
                        <p className="text-lg text-slate-800">{dialogue}</p>
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
            
            {/* Answer Area */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap w-full max-w-5xl mx-auto px-4 py-4 min-h-[120px]">
              {Array.from({ length: currentWordData.word.length }).map((_, index) => {
                const answerItem = userAnswer[index];
                return (
                  <div
                    key={index}
                    onClick={() => answerItem ? handleDeselectLetter(index) : null}
                    className={`${boxSize} font-bold text-center text-slate-800 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center cursor-pointer transition-all hover:border-red-400 hover:bg-red-50`}
                  >
                    {answerItem?.char}
                  </div>
                );
              })}
            </div>

            {/* Jumbled Letter Bank */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap w-full max-w-5xl mx-auto px-4 py-4 min-h-[120px]">
              {letterOptions.map(({ char, id }) => {
                const isUsed = usedOptionIds.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectLetter(char, id)}
                    disabled={isUsed || !!feedback}
                    className={`${boxSize} font-bold text-center text-purple-700 rounded-2xl bg-purple-100 border-2 border-purple-300 transition-all duration-200 flex-shrink-0 flex items-center justify-center
                      ${isUsed ? 'opacity-20 cursor-not-allowed' : 'hover:bg-purple-200 hover:scale-110 cursor-pointer'}
                      ${feedback ? 'cursor-not-allowed' : ''}
                    `}
                  >
                    {char}
                  </button>
                )
              })}
            </div>
        </div>
        
        {/* --- UPDATED: Feedback Area / Shuffle Button --- */}
        <div className="flex items-center justify-center h-24 my-4">
            <AnimatePresence mode="wait">
                {feedback ? (
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
                                    <span className="font-bold text-purple-700">{currentWordData.word}</span>
                                </p>
                            </div>
                        )}
                        {feedback.type === "skipped" && (
                             <div className="flex flex-col items-center gap-1">
                                <XCircle className="w-12 h-12 text-orange-500" />
                                <p className="text-lg text-slate-600">
                                    Skipped:{" "}
                                    <span className="font-bold text-purple-700">{currentWordData.word}</span>
                                </p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    // --- NEW: Shuffle button is shown when there's no feedback ---
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <button
                          onClick={handleShuffleLetters}
                          className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full text-slate-600 font-semibold transition-all transform hover:scale-105"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Shuffle
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        {/* Action Buttons */}
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
                disabled={userAnswer.length !== currentWordData.word.length || !!feedback}
                className={`px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform text-lg shadow-lg
                    ${userAnswer.length !== currentWordData.word.length || !!feedback
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