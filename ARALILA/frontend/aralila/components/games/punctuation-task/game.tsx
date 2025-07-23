
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, CheckCircle2, XCircle, X } from "lucide-react";
import { TIME_LIMIT, BONUS_TIME, BASE_POINTS, PUNCTUATION_MARKS } from "@/data/games/punctuation-task";
import { PunctuationChallengeGameProps, PunctuationResult } from "@/types/games";

export const PunctuationChallengeGame = ({ sentences, onGameComplete, onExit }: PunctuationChallengeGameProps) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userPunctuation, setUserPunctuation] = useState<{ position: number; mark: string }[]>([]);
  const [results, setResults] = useState<PunctuationResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "skipped" } | null>(null);

  const currentSentenceData = sentences[currentSentenceIndex];

  const finishGame = useCallback(() => {
    onGameComplete({ score, results });
  }, [score, results, onGameComplete]);

  const advanceToNext = useCallback(() => {
    const nextIndex = currentSentenceIndex + 1;
    if (nextIndex < sentences.length) {
      setCurrentSentenceIndex(nextIndex);
      setUserPunctuation([]);
      setFeedback(null);
    } else {
      finishGame();
    }
  }, [currentSentenceIndex, sentences.length, finishGame]);

  useEffect(() => {
    if (timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishGame();
    }
  }, [timeLeft, feedback, finishGame]);

  const checkAnswer = () => {
    const correct = currentSentenceData.correctPunctuation;
    const user = userPunctuation;
    if (correct.length !== user.length) return false;
    return correct.every((correctItem) => {
      return user.some(userItem => userItem.position === correctItem.position && userItem.mark === correctItem.mark);
    });
  };

  const submitAnswer = () => {
    if (feedback) return;
    const isCorrect = checkAnswer();
    const newResult: PunctuationResult = { sentenceData: currentSentenceData, userAnswer: [...userPunctuation], isCorrect };

    if (isCorrect) {
      setScore(prev => prev + (streak >= 3 ? BASE_POINTS * 2 : BASE_POINTS));
      setStreak(prev => prev + 1);
      setTimeLeft(prev => Math.min(prev + BONUS_TIME, TIME_LIMIT));
      setFeedback({ type: "success" });
    } else {
      setStreak(0);
      setFeedback({ type: "error" });
    }
    setResults(prev => [...prev, newResult]);
    setTimeout(advanceToNext, 2500);
  };

  const updateInput = (position: number, value: string) => {
    const mark = value.trim();
    if (!PUNCTUATION_MARKS.includes(mark)) return;
    setUserPunctuation(prev => {
      const filtered = prev.filter(p => p.position !== position);
      return [...filtered, { position, mark }];
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!PUNCTUATION_MARKS.includes(e.key)) e.preventDefault();
  };

  const renderSentenceWithInputs = () => {
    const chars = currentSentenceData.sentence.split("");
    const elements: JSX.Element[] = [];

    chars.forEach((char, index) => {
      elements.push(<span key={`char-${index}`} className="text-2xl font-medium text-slate-800">{char}</span>);

      const existing = userPunctuation.find(p => p.position === index + 1);
      elements.push(
        <input
          key={`input-${index}`}
          type="text"
          maxLength={1}
          value={existing?.mark || ""}
          onChange={(e) => updateInput(index + 1, e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-10 h-10 mx-1 font-bold text-center text-slate-800 rounded-2xl bg-slate-100 border-2 border-slate-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300"
          disabled={!!feedback}
        />
      );
    });

    // Add end punctuation slot (-1)
    const endMark = userPunctuation.find(p => p.position === -1);
    elements.push(
      <input
        key="end-slot"
        type="text"
        maxLength={1}
        value={endMark?.mark || ""}
        onChange={(e) => updateInput(-1, e.target.value)}
        onKeyDown={handleKeyPress}
        className="w-10 h-10 ml-2 font-bold text-center text-slate-800 rounded-2xl bg-slate-100 border-2 border-slate-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300"
        disabled={!!feedback}
      />
    );

    return elements;
  };

  return (
    <div className="relative z-10 max-w-[950px] w-full mx-auto p-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col min-h-[70vh] w-full">
        {/* Header */}
        <div className="w-full flex items-center gap-4 mb-8">
          <button onClick={onExit} className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100"><X className="w-6 h-6" /></button>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <motion.div className={`h-4 rounded-full transition-colors duration-500 ${timeLeft <= 15 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-fuchsia-500"}`} animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }} transition={{ duration: 1, ease: "linear" }} />
          </div>
          <div className="flex items-center gap-2"><Star className="w-6 h-6 text-yellow-400" /><span className="text-xl font-bold">{score}</span></div>
          {streak > 1 && <motion.div className="flex items-center gap-1 text-orange-500" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Zap className="w-5 h-5" /><span className="text-lg font-bold">{streak}x</span></motion.div>}
          <div className="text-slate-500 text-lg font-mono">{currentSentenceIndex + 1} / {sentences.length}</div>
        </div>

        {/* Sentence Display */}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl mx-auto mb-8 p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
            <div className="flex flex-wrap items-center justify-center gap-1 leading-relaxed">
              {renderSentenceWithInputs()}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Choose from the following punctuation marks:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {PUNCTUATION_MARKS.map((mark) => (
                <div key={mark} className="w-12 h-12 bg-white border-2 border-purple-300 rounded-xl flex items-center justify-center text-2xl font-bold text-purple-700 cursor-default">
                  {mark}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="flex items-center justify-center h-24 my-4">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div key={feedback.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {feedback.type === "success" && <div className="text-center"><CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" /><p className="text-xl font-bold text-green-600">Correct!</p></div>}
                {feedback.type === "error" && <div className="text-center"><XCircle className="w-12 h-12 text-red-500 mx-auto" /><p className="text-lg text-slate-600">Not quite!</p></div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-end items-center pt-6 border-t border-slate-200">
          <button onClick={submitAnswer} disabled={userPunctuation.length === 0 || !!feedback} className={`px-10 py-4 text-white font-bold rounded-2xl transition-all text-lg shadow-lg ${userPunctuation.length === 0 || !!feedback ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:scale-105"}`}>CHECK</button>
        </div>
      </div>
    </div>
  );
};
