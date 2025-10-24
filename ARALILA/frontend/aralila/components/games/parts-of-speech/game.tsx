"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Star, X, Zap, Volume2 } from "lucide-react";
import {
  PartsOfSpeechQuestion,
  PartsOfSpeechGameProps,
  PartsOfSpeechResult,
} from "@/types/games";
import { PARTS_OF_SPEECH_DIFFICULTY_SETTINGS } from "@/data/games/parts-of-speech";
import Image from "next/image";
import { ConfirmationModal } from "../confirmation-modal";

type LilaState = "normal" | "happy" | "sad" | "worried" | "crying" | "thumbsup";

const DraggableWord = ({ word }: { word: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: word });

  return (
    <span
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="bg-purple-200 border-2 shadow-md border-purple-400 px-4 py-1 rounded-lg font-bold text-purple-800 cursor-grab active:cursor-grabbing"
    >
      {word}
    </span>
  );
};

const DropZone = ({ option }: { option: string }) => {
  const { setNodeRef, isOver } = useDroppable({ id: option });

  return (
    <div
      ref={setNodeRef}
      className={`p-6 rounded-2xl border-2 shadow-md transition-all text-lg font-semibold text-center
        ${
          isOver
            ? "bg-purple-100 border-purple-400"
            : "bg-white border-slate-300"
        }`}
    >
      {option}
    </div>
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ: PartsOfSpeechQuestion = questions[currentQuestionIndex];
  const currentSettings = PARTS_OF_SPEECH_DIFFICULTY_SETTINGS[difficulty];
  const progress = (timeLeft / currentSettings.initialTime) * 100;

  // const happyStates: LilaState[] = ["happy", "thumbsup"];
  // const sadStates: LilaState[] = ["sad", "crying"];

  const finishGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const finalResults = [...results];

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
    onGameComplete({ score, results: finalResults });
  }, [score, results, onGameComplete, currentQuestionIndex, questions]);

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
    setAnimationKey((prev) => prev + 1);
    setLilaState("normal");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishGame();
    }
  }, [currentQuestionIndex, questions.length, finishGame]);

  const handleDragEnd = (event: any) => {
    if (!event.over) return;

    const droppedOn = event.over.id;
    // const word = event.active.id; // dragged word
    const correct = droppedOn === currentQ.correctAnswer;

    setSelectedAnswer(droppedOn);
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
      setLilaState("happy");
    } else {
      newStreak = 0;
      const penalty = currentSettings.wrongPenalty;
      newTimeLeft = Math.max(0, newTimeLeft - penalty);
      setLilaState("sad");
    }

    setScore(newScore);
    setStreak(newStreak);
    setTimeLeft(newTimeLeft);
    setResults((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: droppedOn,
        isCorrect: correct,
        skipped: false,
        hintUsed: false,
      },
    ]);

    // Wait before moving on to the next question
    setTimeout(() => {
      setLilaState("normal"); // reset mascot only now
      nextQuestion();
    }, 2000);
  };

  const skipQuestion = () => {
    if (showFeedback) return;
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

  // const renderSentence = (sentence: string, targetWord: string) => {
  //   return sentence.split(" ").map((part, i) => {
  //     const clean = part.replace(/[.,!?]/g, "");
  //     if (clean.toLowerCase() === targetWord.toLowerCase()) {
  //       return (
  //         <span key={i} className="relative inline-block mx-1">
  //           {/* Placeholder keeps sentence intact */}
  //           <span className="text-gray-400 font-bold">{clean}</span>
  //           {/* Actual draggable sits on top */}
  //           <DraggableWord word={clean} />
  //         </span>
  //       );
  //     }
  //     return (
  //       <span key={i} className="mx-1">
  //         {part}
  //       </span>
  //     );
  //   });
  // };

  // const getAnswerButtonClass = (option: string) => {
  //   if (!showFeedback) {
  //     return selectedAnswer === option
  //       ? "bg-purple-100 border-purple-400 transform scale-95"
  //       : "bg-white border-slate-300 hover:bg-purple-50 hover:border-purple-300";
  //   }

  //   if (option === currentQ.correctAnswer) {
  //     return "bg-green-100 border-green-400 text-green-700";
  //   } else if (option === selectedAnswer && !isCorrect) {
  //     return "bg-red-100 border-red-400 text-red-700";
  //   }
  //   return "bg-slate-100 border-slate-300 opacity-60";
  // };

  // const lilaImage = `/images/character/lila-${lilaState}.png`;

  return (
    <div className="relative z-10 max-w-4xl w-full mx-auto">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
      />

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        {/* ======== HEADER: Corrected Layout ======== */}
        <div className="w-full flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
          {/* Use flex-grow to allow the progress bar to fill available space */}
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
          {/* Group score, streak, and count into a single non-shrinking flex item */}
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
            <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Main Game Content */}
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex-grow w-full flex flex-col items-center justify-center">
            {/* Character + Question */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
              {/* Lila */}
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

              {/* Sentence with draggable word */}
              <div className="text-2xl text-slate-800 font-medium leading-relaxed bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm w-full flex items-center justify-between gap-4">
                <div className="flex gap-4 flex-wrap justify-center">
                  {currentQ.sentence.split(" ").map((part, i) =>
                    part.toLowerCase() === currentQ.word.toLowerCase() ? (
                      <DraggableWord key={i} word={part} />
                    ) : (
                      <span key={i} className="mx-1">
                        {part}
                      </span>
                    )
                  )}
                </div>
                <button
                  onClick={handleListen}
                  className="p-2 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-full text-purple-700"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drop Zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-2xl">
              {currentQ.options.map((option) => (
                <DropZone key={option} option={option} />
              ))}
            </div>
          </div>
        </DndContext>

        {/* Bottom Action Buttons */}
        <div className="w-full flex justify-between items-center pt-5 border-t border-slate-200">
          <button
            onClick={skipQuestion}
            disabled={showFeedback}
            className="px-7 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold rounded-2xl transition-all duration-300 text-base"
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
};
