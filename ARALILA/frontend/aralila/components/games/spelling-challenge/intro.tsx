"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle, ArrowLeft, Info } from "lucide-react";
import Leaderboard from "@/components/games/common/leaderboard";

interface SpellingChallengeIntroProps {
  difficulty: number;
  unlocked?: { [k: number]: boolean };
  onSelectDifficulty?: (d: number) => void;
  onStartChallenge: () => void;
  onReviewLessons?: () => void;
  onBack?: () => void;
}

export const SpellingChallengeIntro = ({
  difficulty,
  unlocked,
  onSelectDifficulty,
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
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-2">
        <div className="relative w-full h-screen overflow-hidden">
          {/* Back Button - Top Left Corner */}
          {onBack && (
            <motion.div
              className="absolute top-10 left-8 z-20"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative group flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-slate-400 rounded-full animate-pulse-24-7 opacity-50"></div>
                </div>
                <motion.button
                  onClick={onBack}
                  className="relative z-10 rounded-full text-white shadow-2xl hover:shadow-slate-500/40 transition-shadow duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-16 h-16 text-white cursor-pointer" />
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
          <div className="relative z-10 flex flex-col items-center justify-start h-full overflow-hidden">
            <motion.div
              className="text-center mb-3"
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
            </motion.div>

            {/* ✅ Difficulty selector */}
            <motion.div
              className="mb-5 flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              {[1, 2, 3].map((d) => {
                const isUnlocked = unlocked ? !!unlocked[d] : d === 1;
                const isActive = difficulty === d;
                return (
                  <button
                    key={d}
                    disabled={!isUnlocked}
                    onClick={() =>
                      onSelectDifficulty && isUnlocked && onSelectDifficulty(d)
                    }
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : isUnlocked
                        ? "bg-white/90 text-purple-700 border border-purple-300 hover:bg-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    aria-pressed={isActive}
                  >
                    {d === 1 ? "Easy" : d === 2 ? "Medium" : "Hard"}
                  </button>
                );
              })}
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
                <div className="w-32 h-32 bg-purple-400 rounded-full animate-pulse-24-7 opacity-50"></div>
              </div>

              <motion.button
                onClick={onStartChallenge}
                className="relative z-10 rounded-full text-white shadow-2xl hover:shadow-purple-500/40 transition-shadow duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayCircle className="w-32 h-32 text-white cursor-pointer" />
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
      </div>

      <div className="md:col-span-1">
        <Leaderboard
          gameId={1}
          gameType="spelling-challenge"
          areaId={4}
          difficulty={difficulty}
          limit={10}
        />
      </div>
    </div>
  );
};
