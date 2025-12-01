"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Star, Zap, CheckCircle2, XCircle, HandHelping } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ConfirmationModal } from "../confirmation-modal";
import { RuntimeGrammarQuestion } from "@/lib/utils";

interface GrammarResult {
  question: RuntimeGrammarQuestion;
  userAnswer: string[];
  isCorrect: boolean;
}

interface GrammarCheckGameProps {
  questions: RuntimeGrammarQuestion[];
  onGameComplete: (summary: {
    percentScore: number;
    rawPoints: number;
    results: GrammarResult[];
  }) => void;
  onExit: () => void;
}

const TIME_LIMIT = 300; //120
const BASE_POINTS = 20;
const MAX_ASSISTS = 3;
type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thinking";

type WordItem = {
  id: string;
  text: string;
  color: string;
};

// Word bank colors
const WORD_COLORS = [
  "bg-blue-200 border-blue-400",
  "bg-green-200 border-green-400",
  "bg-yellow-200 border-yellow-400",
  "bg-pink-200 border-pink-400",
  "bg-purple-200 border-purple-400",
  "bg-orange-200 border-orange-400",
  "bg-teal-200 border-teal-400",
  "bg-indigo-200 border-indigo-400",
];

// Draggable word from word bank
const DraggableWord = ({ word }: { word: WordItem }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: word.id,
      data: word,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${word.color} px-6 py-3 rounded-xl border-2 font-semibold text-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 shadow-md`}
    >
      {word.text}
    </div>
  );
};

// Drop slot for sentence area
const DropSlot = ({
  index,
  word,
  onRemove,
}: {
  index: number;
  word: WordItem | null;
  onRemove: () => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { index },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[120px] min-h-[60px] px-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
        isOver
          ? "border-purple-500 bg-purple-100 scale-105"
          : word
          ? "border-slate-400 bg-white"
          : "border-slate-300 bg-slate-50"
      }`}
    >
      {word ? (
        <div
          onClick={onRemove}
          className={`${word.color} px-6 py-3 rounded-xl border-2 font-semibold text-lg cursor-pointer hover:opacity-80 transition-opacity shadow-md`}
        >
          {word.text}
        </div>
      ) : (
        <span className="text-slate-400 text-sm">Drop here</span>
      )}
    </div>
  );
};

export const GrammarCheckGame = ({
  questions,
  onGameComplete,
  onExit,
}: GrammarCheckGameProps) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [results, setResults] = useState<GrammarResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [rawPoints, setRawPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "skipped";
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [isFinished, setIsFinished] = useState(false);

  // Assists system
  const [assists, setAssists] = useState(MAX_ASSISTS);
  const [showAssistAnimation, setShowAssistAnimation] = useState(false);

  // Word bank (available words)
  const [wordBank, setWordBank] = useState<WordItem[]>([]);
  // Sentence slots (dropped words)
  const [sentenceSlots, setSentenceSlots] = useState<(WordItem | null)[]>([]);
  // Active dragging word
  const [activeWord, setActiveWord] = useState<WordItem | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));
  const currentQ = questions[currentQIndex];

  // Initialize word bank and slots
  useEffect(() => {
    if (currentQ?.jumbledTokens) {
      const words = currentQ.jumbledTokens.map((text, i) => ({
        id: `word-${i}-${text}`,
        text,
        color: WORD_COLORS[i % WORD_COLORS.length],
      }));
      setWordBank(words);
      setSentenceSlots(new Array(currentQ.correctTokens.length).fill(null));
    }
  }, [currentQ]);

  const calculatePercent = (res: GrammarResult[]) => {
    const correct = res.filter((r) => r.isCorrect).length;
    return Math.round((correct / questions.length) * 100);
  };

  const advanceToNext = useCallback(() => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setFeedback(null);
      setLilaState("thinking");
      setAnimationKey((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentQIndex, questions]);

  useEffect(() => {
    if (isFinished) {
      const correctCount = results.filter((r) => r.isCorrect).length;
      const percentScore = Math.round((correctCount / results.length) * 100);

      onGameComplete({
        percentScore,
        rawPoints: score,
        results,
      });
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
      onGameComplete({
        percentScore: calculatePercent(finalResults),
        rawPoints,
        results: finalResults,
      });
    }
  }, [
    timeLeft,
    feedback,
    currentQIndex,
    questions,
    lilaState,
    results,
    rawPoints,
    onGameComplete,
  ]);

  if (!currentQ) {
    return (
      <div className="relative z-10 max-w-[950px] w-full mx-auto p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-4">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold text-red-600">
              No Questions Available
            </h2>
            <p className="text-gray-700">Please go back and try again.</p>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
            >
              Exit Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const word = event.active.data.current as WordItem;
    setActiveWord(word);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveWord(null);

    if (!over) return;

    const word = active.data.current as WordItem;
    const targetId = over.id as string;

    // Dropping into a slot
    if (targetId.startsWith("slot-")) {
      const slotIndex = parseInt(targetId.split("-")[1]);

      // Remove word from word bank if it exists there
      setWordBank((prev) => prev.filter((w) => w.id !== word.id));

      // Remove word from its previous slot if it was already placed
      setSentenceSlots((prev) =>
        prev.map((w) => (w?.id === word.id ? null : w))
      );

      // Place word in the new slot
      setSentenceSlots((prev) => {
        const newSlots = [...prev];
        // If slot is occupied, return that word to word bank
        if (newSlots[slotIndex]) {
          setWordBank((bank) => [...bank, newSlots[slotIndex]!]);
        }
        newSlots[slotIndex] = word;
        return newSlots;
      });
    }
  };

  const removeWordFromSlot = (index: number) => {
    const word = sentenceSlots[index];
    if (!word) return;

    setSentenceSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = null;
      return newSlots;
    });

    setWordBank((prev) => [...prev, word]);
  };

  const handleUseAssist = () => {
    if (assists <= 0 || feedback) return;

    // Find the first incorrect slot
    for (let i = 0; i < currentQ.correctTokens.length; i++) {
      const correctWord = currentQ.correctTokens[i];
      const currentWord = sentenceSlots[i];

      if (currentWord?.text !== correctWord) {
        // Find the correct word in word bank or other slots
        const wordToPlace =
          wordBank.find((w) => w.text === correctWord) ||
          sentenceSlots.find((w) => w?.text === correctWord);

        if (wordToPlace) {
          // Remove from word bank
          setWordBank((prev) => prev.filter((w) => w.id !== wordToPlace.id));

          // Remove from previous slot
          setSentenceSlots((prev) =>
            prev.map((w) => (w?.id === wordToPlace.id ? null : w))
          );

          // Place in correct slot
          setSentenceSlots((prev) => {
            const newSlots = [...prev];
            if (newSlots[i]) {
              setWordBank((bank) => [...bank, newSlots[i]!]);
            }
            newSlots[i] = wordToPlace;
            return newSlots;
          });

          setAssists((prev) => prev - 1);
          setShowAssistAnimation(true);
          setTimeout(() => setShowAssistAnimation(false), 1000);
          break;
        }
      }
    }
  };

  const checkAnswer = () => {
    if (feedback) return;

    const userSentence = sentenceSlots.map((w) => w?.text || "");
    const isCorrect =
      JSON.stringify(userSentence) === JSON.stringify(currentQ.correctTokens);

    const newResult: GrammarResult = {
      question: currentQ,
      userAnswer: userSentence,
      isCorrect,
    };

    if (isCorrect) {
      const points = streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS;
      setScore((prev) => prev + points);
      setRawPoints((prev) => prev + points);
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
        setIsFinished(true);
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
    <div className="relative z-10 max-w-[1100px] w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
        title={"Lumabas sa Laro?"}
        description="Sigurado ka ba na gusto mong umalis? Hindi mase-save ang iyong score."
      />

      {/* Game container */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[75vh] w-full">
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
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <HandHelping className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {assists}
              </span>
            </div>
          </div>
          <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
            {currentQIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Game body */}
        <div className="flex-grow w-full flex flex-col px-15">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Top Section: Lila + Instructions + Word Bank */}
            <div className="w-full flex flex-row items-center justify-center gap-6 mb-6">
              {/* Left: Lila and Instructions */}
              <div className="flex flex-col flex-1/4 items-center justify-center gap-1">
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
                    width={160}
                    height={160}
                    priority
                  />
                </motion.div>
              </div>

              {/* Right: Word Bank */}
              <div className="bg-slate-50 p-6 rounded-2xl border-4 border-dashed border-purple-500 flex flex-col flex-3/4">
                <h3 className="text-center text-sm font-semibold text-slate-700 mb-4">
                  Mga Salita (Word Bank)
                </h3>
                <div className="flex flex-wrap justify-center gap-3 min-h-[120px] flex-grow items-center">
                  {wordBank.map((word) => (
                    <DraggableWord key={word.id} word={word} />
                  ))}
                  {wordBank.length === 0 && (
                    <p className="text-slate-400 italic">
                      Lahat ng salita ay nailagay na
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Sentence Drop Area */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl overflow-hidden border-4 border-dashed border-purple-300 mb-6 p-6">
              <div className="flex flex-wrap justify-center gap-3 min-h-[100px]">
                {sentenceSlots.map((word, index) => (
                  <DropSlot
                    key={`slot-${index}`}
                    index={index}
                    word={word}
                    onRemove={() => removeWordFromSlot(index)}
                  />
                ))}
              </div>
            </div>

            <DragOverlay>
              {activeWord && (
                <div
                  className={`${activeWord.color} px-6 py-3 rounded-xl border-2 font-semibold text-lg shadow-2xl opacity-90`}
                >
                  {activeWord.text}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Feedback */}
        {/* <div className="flex items-center justify-center h-20 my-4">
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
                        {currentQ.correctTokens.join(" ")}
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
                        {currentQ.correctTokens.join(" ")}
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div> */}

        {/* Controls */}
        <div className="w-full flex justify-between items-center pt-5 border-t border-slate-200">
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={!!feedback}
              className="px-7 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-2xl transition-all duration-300 text-base"
            >
              SKIP
            </button>

            <button
              onClick={handleUseAssist}
              disabled={assists <= 0 || !!feedback}
              className="flex items-center gap-2 px-6 py-2 bg-purple-300 border-2 border-purple-400 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-purple-950 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none"
            >
              <HandHelping className="w-5 h-5" />
              <span>Gamitin ang Assist</span>
            </button>
          </div>

          <button
            onClick={checkAnswer}
            disabled={!!feedback}
            className="px-7 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-base transition disabled:opacity-50 flex items-center gap-2 min-w-[180px] justify-center"
          >
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};
