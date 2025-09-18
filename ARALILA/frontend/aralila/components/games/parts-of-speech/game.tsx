"use client";

<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2, XCircle, Zap, Volume2 } from "lucide-react";
import {
  PartsOfSpeechQuestion,
  PartsOfSpeechGameProps,
  PartsOfSpeechResult,
} from "@/types/games";
import { PARTS_OF_SPEECH_DIFFICULTY_SETTINGS } from "@/data/games/parts-of-speech";
import Image from "next/image";
import { ConfirmationModal } from "../confirmation-modal";
import { id } from "date-fns/locale";

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";
const PARTS_OF_SPEECH_CATEGORIES = [
  { id: "Pangngalan", label: "Pangngalan (Noun)" },
  { id: "Pandiwa", label: "Pandiwa (Verb)" },
  { id: "Pang-abay", label: "Pang-abay (Adverb)" },
  { id: "Pang-uri", label: "Pang-uri (Adjective)" },
  { id: "Panghalip", label: "Panghalip (Pronoun)" },
  { id: "Pang-angkop", label: "Pang-angkop (Ligature)" },
];

const TIME_LIMIT = 120;

export const PartsOfSpeechGame: React.FC<PartsOfSpeechGameProps> = ({
  questions,
  onGameComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<PartsOfSpeechResult[]>([]);
  const [wordsLeft, setWordsLeft] = useState<string[]>([]);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [streak, setStreak] = useState(0);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (currentQ) {
      setWordsLeft([currentQ.word]);
    }
  }, [currentIndex, currentQ]);

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (!over) return;

    const word = active.id;
    const chosenCategory = over.id;

    const isCorrect = chosenCategory === currentQ.correctAnswer;

    setResults((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: chosenCategory,
        isCorrect,
        skipped: false,
        hintUsed: false,
      },
    ]);

    if (isCorrect) {
      setScore((s) => s + 10);
      setLilaState("happy"); // ✅ mascot reacts positively
    } else {
      setScore((s) => Math.max(0, s - 5));
      setLilaState("sad"); // ✅ mascot reacts negatively
    }

    // Mark word as dropped (so we render faded version)
    setWordsLeft((prev) => prev.filter((w) => w !== word));
  };

  useEffect(() => {
    if (wordsLeft.length === 0 && currentQ) {
      const timeout = setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          onGameComplete({ score, results });
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [
    wordsLeft,
    currentIndex,
    questions.length,
    onGameComplete,
    score,
    results,
    currentQ,
  ]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") setLilaState("worried");
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      const finalResults = [...results];
      onGameComplete({ score, results: finalResults });
    }
  }, [
    timeLeft,
    // feedback,
    onGameComplete,
    score,
    results,
    currentIndex,
    lilaState,
  ]);

  if (!currentQ) return null;

  const renderSentence = (sentence: string, word: string) => {
    return (
      <div className="text-xl text-slate-800 bg-slate-100 px-6 py-4 rounded-2xl shadow-md flex flex-wrap gap-2 items-center">
        {sentence.split(" ").map((w, idx) => {
          const cleanWord = w.replace(/[.,!?]/g, "");
          const isTarget = cleanWord === word;

          if (isTarget) {
            const isDropped = !wordsLeft.includes(cleanWord);
            return isDropped ? (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl border-2 font-semibold text-slate-400 bg-slate-200 italic opacity-70"
              >
                {cleanWord}
              </span>
            ) : (
              <DraggableWord key={idx} word={cleanWord} />
            );
          }

          return <span key={idx}>{w}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="relative z-10 max-w-4xl w-full mx-auto">
      {/* Exit Confirmation */}
      {isExitModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to exit?</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={onExit}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        {/* Header */}
=======
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, XCircle, Zap, Volume2 } from 'lucide-react';
import { PartsOfSpeechQuestion, PartsOfSpeechGameProps, PartsOfSpeechResult } from '@/types/games';
import { PARTS_OF_SPEECH_DIFFICULTY_SETTINGS } from '@/data/games/parts-of-speech';
import Image from 'next/image';
import { ConfirmationModal } from '../confirmation-modal';

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

export const PartsOfSpeechGame: React.FC<PartsOfSpeechGameProps> = ({
  questions,
  difficulty,
  onGameComplete,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PARTS_OF_SPEECH_DIFFICULTY_SETTINGS[difficulty].initialTime);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [results, setResults] = useState<PartsOfSpeechResult[]>([]);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [lilaState, setLilaState] = useState<LilaState>("normal");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ: PartsOfSpeechQuestion = questions[currentQuestionIndex];
  const currentSettings = PARTS_OF_SPEECH_DIFFICULTY_SETTINGS[difficulty];
  const progress = (timeLeft / currentSettings.initialTime) * 100;

  const happyStates: LilaState[] = ["happy", "thumbsup"];
  const sadStates: LilaState[] = ["sad", "crying"];

  const finishGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const finalResults = [...results];

    for (let i = currentQuestionIndex; i < questions.length; i++) {
      if (!finalResults.some(r => r.question.id === questions[i].id)) {
        finalResults.push({
          question: questions[i],
          userAnswer: "time-out",
          isCorrect: false,
          skipped: true,
          hintUsed: false,
        });
      }
    }
    onGameComplete({ score, results: finalResults });
  }, [score, results, onGameComplete, currentQuestionIndex, questions]);

  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") setLilaState("worried");
    if (timeLeft > 0 && !showFeedback) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      finishGame();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, showFeedback, finishGame, lilaState]);

  const nextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnimationKey(prev => prev + 1);
    setLilaState("normal");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishGame();
    }
  }, [currentQuestionIndex, questions.length, finishGame]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQ.correctAnswer;

    setIsCorrect(correct);
    setShowFeedback(true);

    let newScore = score;
    let newStreak = streak;
    let newTimeLeft = timeLeft;

    if (correct) {
      const bonus = currentSettings.correctBonus;
      const points = newStreak >= 2 ? bonus * 2 : bonus;
      newScore += points;
      newStreak += 1;
      newTimeLeft += bonus;
      setLilaState(happyStates[Math.floor(Math.random() * happyStates.length)]);
    } else {
      newStreak = 0;
      const penalty = currentSettings.wrongPenalty;
      newTimeLeft = Math.max(0, newTimeLeft - penalty);
      setLilaState(sadStates[Math.floor(Math.random() * sadStates.length)]);
    }

    setScore(newScore);
    setStreak(newStreak);
    setTimeLeft(newTimeLeft);
    setResults(prev => [...prev, {
      question: currentQ,
      userAnswer: answer,
      isCorrect: correct,
      skipped: false,
      hintUsed: false,
    }]);

    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const skipQuestion = () => {
    if (showFeedback) return;
    setStreak(0);
    setShowFeedback(true);
    setIsCorrect(false);
    setSelectedAnswer('skipped');
    setLilaState("sad");

    setResults(prev => [...prev, {
      question: currentQ,
      userAnswer: 'skipped',
      isCorrect: false,
      skipped: true,
      hintUsed: false,
    }]);

    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const handleListen = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentQ.sentence);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser does not support the listening feature.");
    }
  };

  const renderSentenceWithHighlight = (sentence: string, word: string) => {
    const parts = sentence.split(new RegExp(`(\\b${word}\\b)`, 'gi'));
    return parts.map((part, index) => (
      <span
        key={index}
        className={part.toLowerCase() === word.toLowerCase() ?
          'bg-purple-200 px-2 py-1 rounded-lg font-bold text-purple-800' :
          ''}
      >
        {part}
      </span>
    ));
  };

  const getAnswerButtonClass = (option: string) => {
    if (!showFeedback) {
      return selectedAnswer === option ?
        'bg-purple-100 border-purple-400 transform scale-95' :
        'bg-white border-slate-300 hover:bg-purple-50 hover:border-purple-300';
    }

    if (option === currentQ.correctAnswer) {
      return 'bg-green-100 border-green-400 text-green-700';
    } else if (option === selectedAnswer && !isCorrect) {
      return 'bg-red-100 border-red-400 text-red-700';
    }
    return 'bg-slate-100 border-slate-300 opacity-60';
  };

  const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="relative z-10 max-w-4xl w-full mx-auto">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        {/* ======== HEADER: Corrected Layout ======== */}
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
        <div className="w-full flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
<<<<<<< HEAD
          <div className="w-full flex items-center gap-4">
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
              {currentIndex + 1} / {questions.length}
=======
          {/* Use flex-grow to allow the progress bar to fill available space */}
          <div className="flex-grow bg-slate-200 rounded-full h-4">
            <motion.div
              className={`h-4 rounded-full transition-colors duration-500 ${
                progress > 50 ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500' :
                progress > 25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          {/* Group score, streak, and count into a single non-shrinking flex item */}
          <div className="flex items-center gap-6 text-slate-700 flex-shrink-0">
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
            <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
              {currentQuestionIndex + 1} / {questions.length}
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Game Content */}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center p-6 space-y-6">
            {/* Sentence + Drag and Drop */}
            <DndContext onDragEnd={handleDragEnd}>
              <div className="flex flex-row gap-10">
                {/* Character */}
                <Image
                  src={`/images/character/lila-${lilaState}.png`}
                  alt="Lila"
                  width={120}
                  height={120}
                />

                <div className="text-xl text-slate-800 bg-slate-100 rounded-2xl shadow-md flex flex-wrap gap-1">
                  {currentQ && renderSentence(currentQ.sentence, currentQ.word)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 w-full max-w-4xl">
                {PARTS_OF_SPEECH_CATEGORIES.map((option) => (
                  <DropZone
                    key={option.id}
                    id={option.id}
                    label={option.label}
                  />
                ))}
              </div>
            </DndContext>

            {/* <p className="text-lg font-semibold mt-6">Score: {score}</p>
            <p className="text-slate-500">
              Sentence {currentIndex + 1} / {questions.length}
            </p> */}
          </div>
=======
        {/* Main Game Content */}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
          {/* Lila Character and Question */}
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
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center w-full max-w-3xl flex flex-col items-center"
            >
              <h2 className="text-lg text-slate-600 mb-6 font-semibold">
                Identify the part of speech for the highlighted word:
              </h2>
              {/* ======== SENTENCE: Corrected Layout to prevent icon overlap ======== */}
              <div className="text-2xl text-slate-800 font-medium leading-relaxed bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm w-full flex items-center justify-between gap-4">
                {/* Sentence text */}
                <span>
                    {renderSentenceWithHighlight(currentQ.sentence, currentQ.word)}
                </span>
                {/* Speaker Button - no longer absolute */}
                <button
                  onClick={handleListen}
                  className="p-2 bg-purple-100/80 hover:bg-purple-200/80 border border-purple-200 rounded-full text-purple-700 transition-all transform hover:scale-110 flex-shrink-0"
                  aria-label="Listen to sentence"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-2xl">
            {currentQ.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 font-semibold text-lg shadow-sm ${getAnswerButtonClass(option)} ${
                  !showFeedback ? 'hover:transform hover:scale-105 active:scale-95' : ''
                } disabled:cursor-not-allowed`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Feedback */}
          <div className="flex items-center justify-center h-24 my-4">
            <AnimatePresence mode="wait">
              {showFeedback && (
                <motion.div key={selectedAnswer} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {isCorrect && selectedAnswer !== 'skipped' && (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                      <p className="text-xl font-bold text-green-600">Correct!</p>
                      {streak > 1 && <p className="text-green-600">Streak bonus applied!</p>}
                    </div>
                  )}
                  {(!isCorrect && selectedAnswer !== 'skipped') && (
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="w-12 h-12 text-red-500" />
                      <p className="text-lg text-slate-600">
                        Correct answer: <span className="font-bold text-purple-700">{currentQ.correctAnswer}</span>
                      </p>
                    </div>
                  )}
                  {selectedAnswer === 'skipped' && (
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="w-12 h-12 text-orange-500" />
                      <p className="text-lg text-slate-600">
                        Skipped: <span className="font-bold text-purple-700">{currentQ.correctAnswer}</span>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="w-full flex justify-between items-center pt-6 border-t border-slate-200">
          <button
            onClick={skipQuestion}
            disabled={showFeedback}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

// ========== DraggableWord ==========
function DraggableWord({ word }: { word: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: word,
    });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="px-4 py-2 rounded-xl border-2 font-semibold cursor-move shadow-sm bg-white border-slate-300 hover:bg-slate-200"
    >
      {word}
    </div>
  );
}

// ========== DropZone ==========
function DropZone({ id, label }: { id: string; label: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`px -4 py-5 rounded-2xl border-4 text-center font-semibold transition-colors
        ${
          isOver
            ? "bg-green-100 border-green-400"
            : "bg-slate-50 border-slate-300"
        }
      `}
    >
      🧺 {label}
    </div>
  );
}
=======
};
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
