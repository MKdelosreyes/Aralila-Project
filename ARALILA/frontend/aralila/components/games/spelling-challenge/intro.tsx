"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle, ArrowLeft, Info } from "lucide-react";

interface SpellingChallengeIntroProps {
  difficulty: number;
  skipMessage?: string | null;
  onStartChallenge: () => void;
  onReviewLessons?: () => void;
  onBack?: () => void;
}

export const SpellingChallengeIntro = ({
  difficulty,
  skipMessage,
  onStartChallenge,
  onBack,
}: SpellingChallengeIntroProps) => {
  const difficultyLabel = { 1: "Easy", 2: "Medium", 3: "Hard" }[difficulty];
  const difficultyColor = {
    1: "bg-green-500",
    2: "bg-yellow-500",
    3: "bg-red-500",
  }[difficulty];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Back Button - Top Left Corner */}
      {onBack && (
        <motion.div
          className="absolute top-8 left-8 z-20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative group flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-slate-400 rounded-full animate-pulse-24-7 opacity-50"></div>
            </div>
            <motion.button
              onClick={onBack}
              className="relative z-10 rounded-full text-white shadow-2xl hover:shadow-slate-500/40 transition-shadow duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-20 h-20 text-white cursor-pointer" />
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                style={{ pointerEvents: "none" }}
              >
                Back
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Image
            src="/images/character/lila-normal.png"
            alt="Lila ready to play"
            width={300}
            height={300}
            className="mx-auto"
          />
          <h1 className="text-7xl font-bold text-white mb-4">
            Spell mo &apos;Yan!
          </h1>

          <div className="inline-block bg-purple-200 text-purple-800 text-base font-bold px-8 py-3 rounded-full mb-2 shadow-md">
            SPELLING
          </div>

          {/* Difficulty Badge */}
          {/* <div className="flex items-center justify-center gap-2 mt-2">
            <div
              className={`${difficultyColor} text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg`}
            >
              {difficultyLabel}
            </div>
          </div> */}

          {/* Skip Message */}
          {skipMessage && (
            <motion.div
              className="mt-6 max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <Info className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm font-semibold text-left">{skipMessage}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="relative group flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 bg-purple-400 rounded-full animate-pulse-24-7 opacity-50"></div>
          </div>

          <motion.button
            onClick={onStartChallenge}
            className="relative z-10 rounded-full text-white shadow-2xl hover:shadow-purple-500/40 transition-shadow duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlayCircle className="w-36 h-36 text-white cursor-pointer" />
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              style={{ pointerEvents: "none" }}
            >
              Start
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
