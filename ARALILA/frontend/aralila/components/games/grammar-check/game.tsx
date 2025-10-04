"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Star, Zap, CheckCircle2, XCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConfirmationModal } from "../confirmation-modal";

interface Question {
  id: number;
  jumbled: string[];
  correct: string[];
}
interface GrammarResult {
  question: Question;
  userAnswer: string[];
  isCorrect: boolean;
}
interface GrammarCheckGameProps {
  questions: Question[];
  onGameComplete: (summary: {
    score: number;
    results: GrammarResult[];
  }) => void;
  onExit: () => void;
}

const TIME_LIMIT = 120;
const BASE_POINTS = 20;
type LilaState = "normal" | "happy" | "sad" | "worried" | "crying";

type WordItem = {
  id: string;
  text: string;
};

// Sortable Item for drag-and-drop
const SortableWord = ({ id, word }: { id: string; word: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "8px 12px",
    margin: "4px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "grab",
    fontSize: "1.25rem",
    fontWeight: 500,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {word}
    </div>
  );
};

export const GrammarCheckGame = ({
  questions,
  onGameComplete,
  onExit,
}: GrammarCheckGameProps) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  // const [words, setWords] = useState<string[]>(questions[0].jumbled);
  const [results, setResults] = useState<GrammarResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentQIndex];

  // Initialize word objects with unique IDs
  const [words, setWords] = useState<WordItem[]>(
    currentQ.jumbled.map((w, i) => ({ id: `${i}-${w}`, text: w }))
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const advanceToNext = useCallback(() => {
    if (currentQIndex < questions.length - 1) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      setWords(
        questions[nextIndex].jumbled.map((w, i) => ({
          id: `${i}-${w}`,
          text: w,
        }))
      );
      setFeedback(null);
      setLilaState("normal");
      setAnimationKey((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentQIndex, questions, onGameComplete, score, results]);

  useEffect(() => {
    if (isFinished) {
      onGameComplete({ score, results });
    }
  }, [isFinished, score, results, onGameComplete]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") setLilaState("worried");

    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      const finalResults = [...results];
      for (let i = currentQIndex; i < questions.length; i++) {
        finalResults.push({
          question: questions[i],
          userAnswer: [],
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
    currentQIndex,
    questions,
    lilaState,
  ]);

  // Drag-and-drop end handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWords((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const checkAnswer = () => {
    if (feedback) return;

    const userSentence = words.map((w) => w.text);
    const isCorrect =
      JSON.stringify(userSentence) === JSON.stringify(currentQ.correct);

    const newResult: GrammarResult = {
      question: currentQ,
      userAnswer: userSentence,
      isCorrect,
    };

    if (isCorrect) {
      const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setFeedback({ type: "success" });
      setLilaState("happy");
      setTimeLeft((prev) => Math.min(prev + 10, TIME_LIMIT));
    } else {
      setStreak(0);
      setFeedback({ type: "error" });
      setLilaState("sad");
    }

    setResults((prev) => {
      const updated = [...prev, newResult];

      if (currentQIndex === questions.length - 1) {
        onGameComplete({ score, results: updated });
      } else {
        setTimeout(advanceToNext, 2500);
      }

      return updated;
    });
  };

  const handleSkip = () => {
    if (feedback) return;
    setStreak(0);
    setFeedback({ type: "skipped" });
    setLilaState("sad");
    setResults((prev) => [
      ...prev,
      { question: currentQ, userAnswer: [], isCorrect: false },
    ]);
    setTimeout(advanceToNext, 2500);
  };

  const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="relative z-10 max-w-[950px] w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />

      {/* Game container */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        {/* Timer and Score Header */}
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
            {currentQIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Game body */}
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
                <p className="text-lg text-slate-800">
                  Ayusin ang pangungusap sa tamang pagkakasunod-sunod.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Draggable Sentence */}
          <div className="bg-slate-50 p-4 rounded-2xl w-full text-center">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={words.map((w) => w.id)}>
                <div className="flex flex-wrap justify-center gap-2">
                  {words.map((word) => (
                    <SortableWord key={word.id} id={word.id} word={word.text} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Feedback */}
        <div className="flex items-center justify-center h-24 my-4">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.type + currentQIndex}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {feedback.type === "success" && (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <p className="text-xl font-bold text-green-600">Tama!</p>
                  </div>
                )}
                {feedback.type === "error" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-red-500" />
                    <p className="text-lg text-slate-600">
                      Ang tamang sagot:{" "}
                      <span className="font-bold text-purple-700">
                        {currentQ.correct.join(" ")}
                      </span>
                    </p>
                  </div>
                )}
                {feedback.type === "skipped" && (
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-12 h-12 text-orange-500" />
                    <p className="text-lg text-slate-600">
                      Na-skip. Tamang sagot:{" "}
                      <span className="font-bold text-purple-700">
                        {currentQ.correct.join(" ")}
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="w-full flex justify-between items-center pt-6 border-t border-slate-200">
          <button
            onClick={handleSkip}
            disabled={!!feedback}
            className="px-10 py-4 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-2xl transition-all duration-300 text-lg"
          >
            SKIP
          </button>
          <button
            onClick={checkAnswer}
            disabled={!!feedback}
            className={`px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform text-lg shadow-lg
              ${
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
