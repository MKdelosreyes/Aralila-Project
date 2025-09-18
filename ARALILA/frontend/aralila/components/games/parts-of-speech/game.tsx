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
