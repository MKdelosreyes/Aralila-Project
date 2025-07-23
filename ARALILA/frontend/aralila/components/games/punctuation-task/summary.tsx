// /components/punctuation-challenge/summary.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, CheckCircle2, XCircle } from "lucide-react";
import { PunctuationResult } from "@/types/games";

interface SummaryProps {
  score: number;
  results: PunctuationResult[];
  onRestart: () => void;
}

// Helper
const buildCorrectSentence = (result: PunctuationResult) => {
    let sentence = result.sentenceData.sentence;
    const sortedPunctuation = [...result.sentenceData.correctPunctuation].sort((a,b) => b.position - a.position);
    sortedPunctuation.forEach(p => {
        if(p.position === -1) {
            sentence += p.mark;
        } else {
            sentence = sentence.slice(0, p.position) + p.mark + sentence.slice(p.position);
        }
    });
    return sentence;
};

const ReviewModal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: -50 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Review Answers</h2>
            <div className="overflow-y-auto space-y-4 pr-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
);

export const PunctuationChallengeSummary = ({ score, results }: SummaryProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracy = results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0;

  return (
    <>
      <motion.div className="relative z-10 bg-white border rounded-3xl p-12 max-w-2xl w-full text-center shadow-2xl" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Image src="/images/character/lila-happy.png" alt="Lila happy" width={150} height={150} className="mx-auto mb-4"/>
        <h1 className="text-4xl font-bold text-purple-700 mb-2">Lesson Complete!</h1>
        <p className="text-slate-500 mb-8">You did a great job!</p>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-yellow-300"><div className="text-3xl font-bold text-slate-800">{score}</div><div className="text-sm text-slate-500">Final Score</div></div>
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-green-300"><div className="text-3xl font-bold text-slate-800">{accuracy}%</div><div className="text-sm text-slate-500">Accuracy</div></div>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-4">
          <button onClick={() => router.push('/student/challenges')} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl">CONTINUE</button>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-transparent hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-xl border-2 border-slate-300">REVIEW LESSON</button>
        </div>
      </motion.div>

      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {results.map((result, index) => (
          <div key={index} className={`p-4 rounded-lg border ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="font-semibold text-slate-600 mb-2">Original: {result.sentenceData.sentence}</p>
            <div className="flex items-center gap-2">
              {result.isCorrect ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
              <p className="font-mono text-slate-800">{buildCorrectSentence(result)}</p>
            </div>
            {!result.isCorrect && <p className="text-sm text-red-600 mt-2">Your answer was incorrect.</p>}
          </div>
        ))}
      </ReviewModal>
    </>
  );
};