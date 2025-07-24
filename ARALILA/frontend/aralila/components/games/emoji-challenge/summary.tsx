"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';
import { Target, Trophy, CheckCircle2, XCircle, Home } from "lucide-react";

// Interfaces
interface Question {
  id: number;
  emojis: string[];
  correctSentence: string;
  hint: string;
  category: string;
}
export interface GameResult {
  questionData: Question;
  isCorrect: boolean;
}
interface SummaryProps {
  score: number;
  results: GameResult[];
  onRestart: () => void;
}

const ReviewModal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Review Challenge</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><XCircle size={28} /></button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const EmojiChallengeSummary = ({ score, results }: SummaryProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const totalQuestions = results.length;
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let summaryContent = { title: "Great Job!", imageSrc: "/images/character/lila-normal.png", showConfetti: false };
  if (accuracy === 100) {
    summaryContent = { title: "Perfect!", imageSrc: "/images/character/lila-happy.png", showConfetti: true };
  } else if (accuracy >= 80) {
    summaryContent = { title: "Awesome Effort!", imageSrc: "/images/character/lila-happy.png", showConfetti: true };
  } else if (accuracy < 40) {
    summaryContent = { title: "Keep Practicing!", imageSrc: "/images/character/lila-crying.png", showConfetti: false };
  }

  return (
    <>
      <motion.div className="relative z-10 bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 max-w-2xl w-full text-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        {summaryContent.showConfetti && windowSize.width > 0 && (
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />
        )}

        <Image src={summaryContent.imageSrc} alt="Summary character" width={150} height={150} className="mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-purple-700 mb-2">{summaryContent.title}</h1>
        <p className="text-slate-500 mb-8">Here’s a summary of your game.</p>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-10">
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-yellow-400 flex flex-col items-center">
            <Trophy className="text-yellow-500 mb-1" size={28} />
            <div className="text-3xl font-bold text-slate-800">{score}</div>
            <div className="text-sm text-slate-500 mt-1">Score</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-green-400 flex flex-col items-center">
            <Target className="text-green-500 mb-1" size={28} />
            <div className="text-3xl font-bold text-slate-800">{accuracy}%</div>
            <div className="text-sm text-slate-500 mt-1">Accuracy</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-4">
          <button
            onClick={() => router.push('/student/challenges')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-transform transform hover:scale-105">
           CONTINUE
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-transparent hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-xl border-2 border-slate-300 transition-all">
            REVIEW LESSONS
          </button>
        </div>
      </motion.div>

      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="overflow-y-auto pr-2 -mr-2">
          <div className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-xl border flex items-start gap-4 ${result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`mt-1 flex-shrink-0 ${result.isCorrect ? "text-green-500" : "text-red-500"}`}>
                  {result.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {result.questionData.emojis.map((e, i) => (
                      <span key={i} className="text-2xl">{e}</span>
                    ))}
                  </div>
                  <p className="font-bold text-slate-800">{result.questionData.correctSentence}</p>
                  <p className="text-sm text-slate-500 mt-1">({result.questionData.hint})</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ReviewModal>
    </>
  );
};
