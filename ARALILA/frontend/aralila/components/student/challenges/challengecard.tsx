"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";

interface ChallengeCardProps {
  card: {
    id: number;
    title: string;
    slug: string;
    image: string;
    category: string;
    description: string;
    stars_earned?: number; // NEW: 0-3 stars earned
    next_difficulty?: number; // NEW: next difficulty to play (1, 2, or 3)
    replay_mode?: boolean; // NEW: if player has mastered (3 stars)
  };
  isActive: boolean;
  areaId: number;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  card,
  isActive,
  areaId,
}) => {
  const scale = isActive ? 1.05 : 0.75;
  const opacity = isActive ? 1 : 0.3;

  // Default to 0 stars if not provided (first-time players)
  const starsEarned = card.stars_earned ?? 0;
  const nextDifficulty = card.next_difficulty ?? 1;
  const replayMode = card.replay_mode ?? false;

  // Determine button text based on progress
  const getButtonText = () => {
    if (replayMode) {
      return "Play Again"; // Mastered all difficulties
    }
    if (starsEarned === 0) {
      return "Start Challenge"; // First time
    }
    return `Continue (${starsEarned + 1}★)`; // Show next star to earn
  };

  return (
    <div className="w-[360px] h-[25rem] flex-shrink-0" aria-hidden={!isActive}>
      <motion.div
        animate={{ scale, opacity }}
        whileHover={isActive ? { scale: 1.1 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`w-full h-full rounded-[2rem] bg-white overflow-visible flex flex-col transition-shadow duration-500 ${
          isActive
            ? "shadow-[0px_0px_30px_-5px_rgba(168,85,247,0.4)]"
            : "shadow-xl"
        }`}
      >
        {/* Stars Display - Above Card */}
        <div className="flex flex-row absolute z-10 mt-[-50px] p-4 md:p-6 w-full items-center justify-center">
          {[1, 2, 3].map((starNum) => (
            <motion.div
              key={starNum}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: isActive ? 0.1 * starNum : 0,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <Image
                src={
                  starNum <= starsEarned
                    ? "/images/art/Active-Star.png"
                    : "/images/art/Inactive-Star.png"
                }
                alt={`star-${starNum}`}
                width={starNum === 2 ? 100 : 80} // Middle star slightly bigger
                height={starNum === 2 ? 100 : 80}
                className={`mt-[-10px] transition-all duration-300 ${
                  starNum <= starsEarned
                    ? "animate-pulse" // Active stars pulse
                    : "opacity-50 grayscale" // Inactive stars are dimmed
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Card Image */}
        <div className="relative w-full h-56 flex-shrink-0 p-3 pb-0">
          <div className="w-full h-full rounded-[1.2rem] overflow-hidden relative shadow-lg">
            <Image
              src={card.image}
              alt={card.title}
              fill
              priority={isActive}
              quality={100}
              sizes="352px"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-col flex-grow p-5 pt-3">
          <div className="flex-grow">
            <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight">
              {card.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-2">
              {card.description}
            </p>

            {/* Progress Indicator */}
            {starsEarned > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs font-semibold text-purple-600">
                  ⭐ {starsEarned}/3 completed
                </div>
                {replayMode && (
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    ✓ Mastered
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Play Button */}
          {isActive && (
            <div className="pt-1 border-t border-gray-100">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Link
                  href={`/student/challenges/${areaId}/games/${card.slug}?area=${areaId}&difficulty=${nextDifficulty}`}
                >
                  <button
                    className={`w-full font-bold py-3 px-6 rounded-xl text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] ${
                      replayMode
                        ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
                        : "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                    }`}
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    {getButtonText()}
                  </button>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChallengeCard;
