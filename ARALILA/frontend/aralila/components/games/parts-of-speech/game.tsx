"use client";

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
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
};