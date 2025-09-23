"use client";

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
      <div className="text-xl text-slate-800 px-4 py-2 rounded-2xl flex flex-wrap gap-2 items-center">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
        <div className="w-full flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
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
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
          <div className="flex-grow w-full flex flex-col">
            <DndContext onDragEnd={handleDragEnd}>
              {/* Game Play Area */}
              <div className="flex-grow bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 relative min-h-[500px] border-4 border-dashed border-purple-200">
                {/* Floating Sentence Display */}
                <div className="absolute top-6 left-7/12 transform -translate-x-1/2 z-20">
                  <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-200 max-w-2xl">
                    <div className="text-lg leading-relaxed text-slate-800 flex flex-wrap gap-2 items-center justify-center">
                      {currentQ &&
                        renderSentence(currentQ.sentence, currentQ.word)}
                    </div>
                  </div>
                </div>

                {/* Character - positioned playfully */}
                <div className="absolute bottom-8 right-8 z-10">
                  <div className="relative">
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        rotate: lilaState === "happy" ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Image
                        src={`/images/character/lila-${lilaState}.png`}
                        alt="Lila"
                        width={120}
                        height={120}
                        className="drop-shadow-lg"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Category Drop Zones - scattered like islands */}
                <div className="absolute inset-0 p-8">
                  {PARTS_OF_SPEECH_CATEGORIES.map((option, index) => {
                    // Position categories in different areas of the play space
                    const positions = [
                      { top: "38%", left: "20%" },
                      { top: "40%", right: "5%" },
                      { bottom: "20%", left: "8%" },
                      { bottom: "28%", right: "28%" },
                      { top: "10%", left: "5%" },
                      { bottom: "5%", right: "31%" },
                    ];

                    return (
                      <motion.div
                        key={option.id}
                        className="absolute"
                        style={positions[index]}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: index * 0.2,
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="relative">
                          {/* Decorative elements around categories */}
                          <div className="absolute -inset-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse"></div>
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${index * 0.3}s` }}
                          ></div>
                          <div
                            className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-ping"
                            style={{ animationDelay: `${index * 0.5}s` }}
                          ></div>

                          <DropZone id={option.id} label={option.label} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Decorative floating elements */}
                <div
                  className="absolute top-20 right-20 w-6 h-6 bg-yellow-300 rounded-full opacity-60 animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute top-40 left-16 w-4 h-4 bg-pink-300 rounded-full opacity-60 animate-bounce"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute bottom-40 right-32 w-5 h-5 bg-blue-300 rounded-full opacity-60 animate-bounce"
                  style={{ animationDelay: "1.5s" }}
                ></div>

                {/* Animated background patterns */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
                  <div
                    className="absolute bottom-20 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className="absolute top-1/2 left-1/3 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "2s" }}
                  ></div>
                </div>
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
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
      className={`px-4 py-5 rounded-4xl border-4 text-center font-semibold transition-colors bg-gradient-to-r from-purple-200 to-pink-200 opacity-70 animate-pulse text-purple-800
        ${
          isOver
            ? "bg-green-100 border-b-green-200"
            : "bg-slate-50 border-slate-300"
        }
      `}
    >
      🧺 {label}
    </div>
  );
}
