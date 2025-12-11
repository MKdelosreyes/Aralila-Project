"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Star, X, Zap, Volume2, HandHelping } from "lucide-react";
import {
  PartsOfSpeechQuestion,
  PartsOfSpeechGameProps,
  PartsOfSpeechResult,
  PartsOfSpeechDifficulty,
} from "@/types/games";
import { PARTS_OF_SPEECH_DIFFICULTY_SETTINGS } from "@/data/games/parts-of-speech";
import Image from "next/image";
import { ConfirmationModal } from "../confirmation-modal";
import { generatePartsOfSpeechOptions } from "@/lib/utils";

const MAX_ASSISTS = 3;

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

const DraggableWord = ({
  word,
  disabled,
}: {
  word: string;
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: word,
      disabled: disabled,
    });

  return (
    <>
      {/* Grayscale placeholder when dragging */}
      {isDragging && (
        <div className="bg-slate-200 border-2 border-dashed border-slate-400 px-8 py-4 rounded-2xl font-bold text-slate-400 text-2xl shadow-lg opacity-50">
          {word}
        </div>
      )}

      {/* Actual draggable element */}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
          opacity: isDragging ? 0.8 : 1,
          position: isDragging ? "fixed" : "relative",
          zIndex: isDragging ? 9999 : "auto",
        }}
        className={`bg-purple-200 border-2 border-dashed border-purple-400 px-8 py-4 rounded-2xl font-bold text-purple-800 text-2xl shadow-lg ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {word}
      </div>
    </>
  );
};

const DropZone = ({
  option,
  isCorrect,
  showFeedback,
  isHighlighted,
}: {
  option: string;
  isCorrect: boolean;
  showFeedback: boolean;
  isHighlighted?: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: option });

  return (
    <motion.div
      ref={setNodeRef}
      initial={isHighlighted ? { scale: 1 } : {}}
      animate={
        isHighlighted
          ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0px rgba(147, 51, 234, 0)",
                "0 0 20px rgba(147, 51, 234, 0.6)",
                "0 0 0px rgba(147, 51, 234, 0)",
              ],
            }
          : {}
      }
      transition={{ duration: 0.6, repeat: isHighlighted ? Infinity : 0 }}
      className={`p-6 rounded-2xl border-2 shadow-md transition-all text-lg font-semibold text-center min-h-[80px] flex items-center justify-center
        ${
          showFeedback && isCorrect
            ? "bg-green-100 border-dashed transition-all border-green-400 text-green-700"
            : isHighlighted
            ? "bg-purple-200 border-solid border-purple-500 text-purple-800 ring-4 ring-purple-300"
            : isOver
            ? "bg-purple-100 border-dashed transition-all border-purple-400"
            : "bg-white border-dashed transition-all border-slate-300"
        }`}
    >
      {option}
    </motion.div>
  );
};

export const PartsOfSpeechGame: React.FC<PartsOfSpeechGameProps> = ({
  questions,
  difficulty,
  onGameComplete,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    PARTS_OF_SPEECH_DIFFICULTY_SETTINGS[difficulty].initialTime
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [_animationKey, setAnimationKey] = useState(0);
  const [results, setResults] = useState<PartsOfSpeechResult[]>([]);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [gameStartTime] = useState<number>(Date.now());

  // Assists system
  const [assists, setAssists] = useState(MAX_ASSISTS);
  const [showAssistHighlight, setShowAssistHighlight] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<PartsOfSpeechResult[]>([]);
  
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  const currentQ: PartsOfSpeechQuestion = questions[currentQuestionIndex];

  const currentOptions = useMemo(() => {
    return (
      currentQ.options || generatePartsOfSpeechOptions(currentQ.correctAnswer)
    );
  }, [currentQ.correctAnswer, currentQ.options]);

  const currentSettings = PARTS_OF_SPEECH_DIFFICULTY_SETTINGS[difficulty];
  const progress = (timeLeft / currentSettings.initialTime) * 100;

  const computePercent = (res: PartsOfSpeechResult[]) => {
    const total = questions.length || 1;
    const correct = res.filter((r) => r.isCorrect).length;
    return Math.round((correct / total) * 100);
  };

  const finishGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const finalResults = [...resultsRef.current];

    for (let i = currentQuestionIndex; i < questions.length; i++) {
      if (!finalResults.some((r) => r.question.id === questions[i].id)) {
        finalResults.push({
          question: questions[i],
          userAnswer: "time-out",
          isCorrect: false,
          skipped: true,
          hintUsed: false,
        });
      }
    }
    const timeTaken = (Date.now() - gameStartTime) / 1000;
    onGameComplete({
      percentScore: computePercent(finalResults),
      rawPoints: score,
      results: finalResults,
      timeTaken,
    });
  }, [score, onGameComplete, currentQuestionIndex, questions, gameStartTime]);

  useEffect(() => {
    if (timeLeft <= 15 && lilaState === "normal") setLilaState("worried");
    if (timeLeft > 0 && !showFeedback) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
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
    setShowAssistHighlight(false);
    setAnimationKey((prev) => prev + 1);
    setLilaState("normal");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishGame();
    }
  }, [currentQuestionIndex, questions.length, finishGame]);

  const handleDragEnd = (event: any) => {
    if (!event.over || showAssistHighlight) return;

    const droppedOn = event.over.id;
    const correct = droppedOn === currentQ.correctAnswer;

    setSelectedAnswer(droppedOn);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const bonus = currentSettings.correctBonus;
      const points = streak >= 2 ? bonus * 2 : bonus;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setTimeLeft((prev) =>
        Math.min(prev + bonus, currentSettings.initialTime)
      );
      setLilaState("happy");

      setResults((prev) => [
        ...prev,
        {
          question: currentQ,
          userAnswer: droppedOn,
          isCorrect: true,
          skipped: false,
          hintUsed: false,
        },
      ]);

      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      setLilaState("sad");
      setStreak(0);
      const penalty = currentSettings.wrongPenalty;
      setTimeLeft((prev) => Math.max(0, prev - penalty));

      setResults((prev) => [
        ...prev,
        {
          question: currentQ,
          userAnswer: droppedOn,
          isCorrect: false,
          skipped: false,
          hintUsed: false,
        },
      ]);

      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  };

  const handleUseAssist = () => {
    if (assists <= 0 || showFeedback || showAssistHighlight) return;

    setAssists((a) => a - 1);
    setShowAssistHighlight(true);
    setLilaState("thumbsup");

    // Record as hint used
    setResults((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: currentQ.correctAnswer,
        isCorrect: true,
        skipped: false,
        hintUsed: true,
      },
    ]);

    // Don't add points for assisted answers
    // Move to next question after 3 seconds
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const skipQuestion = () => {
    if (showFeedback || showAssistHighlight) return;
    setStreak(0);
    setShowFeedback(true);
    setIsCorrect(false);
    setSelectedAnswer("skipped");
    setLilaState("sad");

    setResults((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: "skipped",
        isCorrect: false,
        skipped: true,
        hintUsed: false,
      },
    ]);

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

  const renderSentenceWithHighlight = () => {
    if (!currentQ || !currentQ.word || !currentQ.sentence) {
      return (
        <div className="relative z-10 max-w-6xl w-full mx-auto p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center space-y-4">
              <div className="text-6xl">😕</div>
              <h2 className="text-2xl font-bold text-red-600">
                Invalid Question Data
              </h2>
              <p className="text-gray-700">
                The question data is incomplete or missing.
              </p>
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

    if (!currentQ?.sentence || !currentQ?.word) {
      return <span className="text-slate-600">No sentence available</span>;
    }

    return currentQ.sentence.split(" ").map((word, i) => {
      const cleanWord = word.replace(/[.,!?]/g, "");
      if (cleanWord.toLowerCase() === currentQ.word?.toLowerCase()) {
        return (
          <span
            key={i}
            className="text-purple-700 font-bold underline decoration-purple-400 decoration-2 mx-1"
          >
            {word}
          </span>
        );
      }
      return (
        <span key={i} className="mx-1">
          {word}
        </span>
      );
    });
  };

  return (
    <div className="relative z-10 max-w-6xl w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
        title={"Lumabas sa Laro?"}
        description="Sigurado ka ba na gusto mong umalis? Hindi mase-save ang iyong score."
      />

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        {/* Header */}
        <div className="w-full flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-grow bg-slate-200 rounded-full h-4">
            <motion.div
              className={`h-4 rounded-full transition-colors duration-500 ${
                progress > 50
                  ? "bg-gradient-to-r from-purple-500 to-fuchsia-500"
                  : progress > 25
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          <div className="flex items-center gap-6 text-slate-700 flex-shrink-0">
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
            {/* Assists counter */}
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <HandHelping className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {assists}
              </span>
            </div>
            <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Main Game Content */}
        <div className="rounded-2xl overflow-hidden border-4 border-dashed border-purple-200 p-5 mx-14">
          <DndContext onDragEnd={handleDragEnd}>
            <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Side: Character with Speech Bubble */}
              <div className="flex flex-col items-center gap-6">
                {/* Speech Bubble with Sentence - Above Character */}
                <div className="relative bg-slate-100 rounded-3xl p-6 border-2 border-slate-300 shadow-lg w-full max-w-md">
                  {/* Bubble tail pointing down */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-slate-300"></div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[18px] border-t-slate-100"></div>

                  <div className="text-lg text-slate-800 leading-relaxed text-center break-words">
                    {renderSentenceWithHighlight()}
                  </div>

                  <button
                    onClick={handleListen}
                    className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-full text-purple-700 font-semibold transition-all"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Character */}
                <motion.div
                  className="relative"
                  key={lilaState}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Image
                    src={`/images/character/lila-${lilaState}.png`}
                    alt="Lila"
                    width={150}
                    height={150}
                  />
                </motion.div>

                {/* Draggable Word - Below Character */}
                <div className="mt-4">
                  <DraggableWord
                    word={currentQ.word}
                    disabled={showAssistHighlight}
                  />
                </div>
              </div>

              {/* Right Side: Drop Zones (Parts of Speech Options) */}
              <div className="flex flex-col gap-4">
                {currentOptions.map((option, index) => (
                  <DropZone
                    key={`${option}-${index}`}
                    option={option}
                    isCorrect={
                      option === currentQ.correctAnswer &&
                      selectedAnswer === option
                    }
                    showFeedback={showFeedback}
                    isHighlighted={
                      showAssistHighlight && option === currentQ.correctAnswer
                    }
                  />
                ))}
              </div>
            </div>
          </DndContext>
        </div>

        {/* Bottom Action Buttons */}
        <div className="w-full flex justify-between items-center pt-5 border-t border-slate-200">
          <button
            onClick={skipQuestion}
            disabled={showAssistHighlight}
            className="px-7 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 font-bold rounded-2xl transition-all duration-300 text-base"
          >
            SKIP
          </button>

          <button
            onClick={handleUseAssist}
            disabled={assists <= 0 || showAssistHighlight || showFeedback}
            className="flex items-center gap-2 px-6 py-2 bg-purple-300 border-2 border-purple-400 hover:bg-purple-400 disabled:bg-slate-300 disabled:border-slate-400 disabled:cursor-not-allowed text-purple-950 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none"
          >
            <HandHelping className="w-5 h-5" />
            <span>Gamitin ang Assist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
