"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, X, SkipForward, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

// --- For the Confirmation Modal (Assuming it exists in this path) ---
// You might need to create this component based on the example provided.
// import { ConfirmationModal } from "../confirmation-modal";

// --- Helper: Simple Confirmation Modal Placeholder ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Sigurado ka na?</h2>
        <p className="text-slate-600 mb-6">Kung aalis ka, hindi mase-save ang iyong score.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold">
            Hindi
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold">
            Oo, aalis na
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Interfaces ---
interface Question {
  id: number;
  emojis: string[];
  correctSentence: string;
  hint: string;
  category: string;
}
interface GameResult {
  questionData: Question;
  isCorrect: boolean;
}
interface GameProps {
  questions: Question[];
  onGameComplete: (summary: { score: number; results: GameResult[] }) => void;
  onExit: () => void;
}

// --- Constants ---
const TIME_LIMIT = 180; // 3 minutes total
const BONUS_TIME = 5;   // +5 seconds for a correct answer
const MAX_MISTAKES = 6;
const FILIPINO_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÑ".split('');

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";
type GameStatus = 'playing' | 'failed' | 'completed' | 'skipped';

// --- Animation Variants ---
const letterVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
};

// --- Main Game Component ---
export const EmojiHulaSalitaGame = ({ questions, onGameComplete, onExit }: GameProps) => {
  const [shuffledQuestions] = useState(() => [...questions].sort(() => Math.random() - 0.5));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [results, setResults] = useState<GameResult[]>([]);

  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [dialogue, setDialogue] = useState("");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const currentQuestion = useMemo(() => shuffledQuestions[currentQuestionIndex], [shuffledQuestions, currentQuestionIndex]);
  const words = useMemo(() => currentQuestion.correctSentence.toUpperCase().split(' '), [currentQuestion]);
  const sentenceLetters = useMemo(() => new Set(currentQuestion.correctSentence.toUpperCase().replace(/ /g, '')), [currentQuestion]);

  // --- Game Flow Control ---
  const advanceToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onGameComplete({ score, results });
    }
  }, [currentQuestionIndex, onGameComplete, results, score, shuffledQuestions.length]);

  // Setup for the new question
  useEffect(() => {
    if (!currentQuestion) return;
    setGuessedLetters(new Set());
    setMistakes(0);
    setStatus('playing');
    setLilaState("normal");
    setDialogue(currentQuestion.hint);
  }, [currentQuestion]);


  // --- Timer Logic ---
  useEffect(() => {
    if (status !== 'playing') return;

    if (timeLeft <= 0) {
      onGameComplete({ score, results });
      return;
    }
    
    if (timeLeft <= 15 && lilaState === 'normal') {
      setLilaState("worried");
      setDialogue("Naku, paubos na ang oras! 😥");
    }

    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, status, onGameComplete, score, results, lilaState]);


  // --- Main Guessing Logic ---
  const handleGuess = useCallback((letter: string) => {
    if (status !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!sentenceLetters.has(letter)) {
      // Incorrect Guess
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setLilaState("sad");
      setDialogue("Ay, mali! Subukan muli.");

      if (newMistakes >= MAX_MISTAKES) {
        setStatus('failed');
        setLilaState("crying");
        setDialogue("Oh hindi! Sa susunod ulit.");
        setStreak(0);
        setResults(prev => [...prev, { questionData: currentQuestion, isCorrect: false }]);
        setTimeout(advanceToNextQuestion, 3000);
      }
    } else {
      // Correct Guess
      const isSolved = [...sentenceLetters].every(char => newGuessedLetters.has(char));
      if (isSolved) {
        setStatus('completed');
        const points = 20 + (streak * 5);
        setScore(prev => prev + points);
        setStreak(prev => prev + 1);
        setTimeLeft(prev => Math.min(prev + BONUS_TIME, TIME_LIMIT));
        setResults(prev => [...prev, { questionData: currentQuestion, isCorrect: true }]);
        setLilaState(Math.random() > 0.5 ? "happy" : "thumbsup");
        setDialogue("Magaling! Nakuha mo! ✨");
        setTimeout(advanceToNextQuestion, 2500);
      } else {
        setLilaState("normal");
        setDialogue("Ayan, tama 'yan! Ipagpatuloy mo lang.");
      }
    }
  }, [status, guessedLetters, sentenceLetters, mistakes, advanceToNextQuestion, streak, currentQuestion, dialogue]);

  const handleSkip = () => {
    if (status !== 'playing') return;
    setStatus('skipped');
    setLilaState("sad");
    setDialogue("Okay lang 'yan. Eto ang susunod.");
    setStreak(0);
    setResults(prev => [...prev, { questionData: currentQuestion, isCorrect: false }]);
    setTimeout(advanceToNextQuestion, 2500);
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        const key = e.key.toUpperCase();
        if (FILIPINO_ALPHABET.includes(key)) {
            handleGuess(key);
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleGuess]);

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
          <button onClick={() => setIsExitModalOpen(true)} className="text-slate-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className={`h-4 rounded-full transition-colors duration-500 ${timeLeft <= 15 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-fuchsia-500"}`}
              animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          <div className="flex items-center justify-end gap-4 text-slate-700">
            <div className="flex items-center gap-2"><Star className="w-6 h-6 text-yellow-400" /> <span className="text-xl font-bold">{score}</span></div>
            {streak > 1 && <motion.div className="flex items-center gap-1 text-orange-500" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Zap className="w-5 h-5" /> <span className="text-lg font-bold">{streak}x</span></motion.div>}
          </div>
          <div className="text-slate-500 text-lg font-mono whitespace-nowrap">{currentQuestionIndex + 1} / {shuffledQuestions.length}</div>
        </div>

        {/* Main Game Area */}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
          
          {/* Lila and Dialogue */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-6">
            <motion.div key={lilaState} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <Image src={lilaImage} alt="Lila" width={140} height={140} priority />
            </motion.div>
            <motion.div key={dialogue} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative bg-purple-50 border border-purple-200 p-4 rounded-xl shadow-md max-w-sm text-center">
              <p className="text-lg text-slate-800">{dialogue}</p>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-purple-50"></div>
            </motion.div>
          </div>

          <div className="flex justify-center items-center space-x-2 md:space-x-4 mb-6">
            {currentQuestion.emojis.map((emoji, index) => <motion.div key={index} className="text-5xl md:text-6xl" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>{emoji}</motion.div>)}
          </div>
          
          {/* Sentence Blanks */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mb-6 px-2 md:px-4">
            {words.map((word, wIndex) => (
              <div key={wIndex} className="flex gap-1.5">
                {word.split('').map((letter, lIndex) => {
                  const isRevealed = guessedLetters.has(letter) || ['failed', 'skipped'].includes(status);
                  return (
                    <div key={lIndex} className={`w-9 h-11 md:w-10 md:h-12 rounded-lg flex items-center justify-center border-b-4 transition-colors duration-300 ${isRevealed ? 'bg-purple-100 border-purple-400' : 'bg-slate-200 border-slate-300'}`}>
                      <AnimatePresence>
                        {isRevealed && (
                          <motion.span className="font-bold text-2xl md:text-3xl text-slate-800" variants={letterVariants} initial="hidden" animate="visible">
                            {letter}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Feedback Area */}
          <div className="h-16 mb-2 flex items-center justify-center text-lg font-semibold">
              <AnimatePresence mode="wait">
                  {status === 'completed' && <motion.div key="completed" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="flex items-center gap-2 text-green-600"><CheckCircle2/> Correct!</motion.div>}
                  {status === 'failed' && <motion.div key="failed" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="flex items-center gap-2 text-red-600"><XCircle/> Incorrect!</motion.div>}
                  {status === 'skipped' && <motion.div key="skipped" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="flex items-center gap-2 text-orange-600"><XCircle/> Skipped!</motion.div>}
                  {status === 'playing' && <motion.div key="playing" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center gap-2 text-slate-500"><AlertCircle className="w-5 h-5"/> Mistakes: {mistakes} / {MAX_MISTAKES}</motion.div>}
              </AnimatePresence>
          </div>

          {/* Keyboard */}
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 max-w-3xl">
            {FILIPINO_ALPHABET.map(key => {
              const isGuessed = guessedLetters.has(key);
              const isCorrect = isGuessed && sentenceLetters.has(key);
              const isIncorrect = isGuessed && !sentenceLetters.has(key);

              return (
                <button 
                  key={key} 
                  onClick={() => handleGuess(key)}
                  disabled={isGuessed || status !== 'playing'}
                  className={`w-9 h-9 md:w-11 md:h-11 rounded-md font-bold text-base md:text-lg transition-all duration-300
                    ${isCorrect ? 'bg-purple-500 text-white' : ''}
                    ${isIncorrect ? 'bg-slate-400 text-white opacity-60' : ''}
                    ${!isGuessed ? 'bg-slate-200 hover:bg-purple-200 text-slate-700' : ''}
                    disabled:cursor-not-allowed
                  `}
                >
                  {key}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full flex justify-center items-center pt-6 mt-4 border-t border-slate-200">
           <button
                onClick={handleSkip}
                disabled={status !== 'playing'}
                className="flex items-center gap-2 px-8 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-full transition-all duration-300 text-lg transform hover:scale-105"
            >
                <SkipForward className="w-5 h-5" />
                SKIP
            </button>
        </div>
      </div>
    </div>
  );
};