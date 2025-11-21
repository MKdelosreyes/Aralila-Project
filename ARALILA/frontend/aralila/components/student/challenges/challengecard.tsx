"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChallengeCardProps {
  card: {
    id: number;
    title: string;
    slug: string;
    image: string;
    category: string;
    description: string;
    stars_earned?: number;
    next_difficulty?: number;
    replay_mode?: boolean;
  };
  isActive: boolean;
  areaId: number;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  card,
  isActive,
  areaId,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const scale = isActive ? 1.05 : 0.75;
  const opacity = isActive ? 1 : 0.3;

  const starsEarned = card.stars_earned ?? 0;
  const nextDifficulty = card.next_difficulty ?? 1;
  const replayMode = card.replay_mode ?? false;

  const getButtonText = () => {
    if (replayMode) {
      return "Play Again";
    }
    if (starsEarned === 0) {
      return "Start Challenge";
    }
    return `Continue`;
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);

    // Navigate to the game intro page
    router.push(
      `/student/challenges/${areaId}/games/${card.slug}?area=${areaId}&difficulty=${nextDifficulty}`
    );
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
                width={starNum === 2 ? 100 : 80}
                height={starNum === 2 ? 100 : 80}
                className={`mt-[-10px] transition-all duration-300 ${
                  starNum <= starsEarned
                    ? "animate-pulse"
                    : "opacity-50 grayscale"
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
          </div>

          {/* Play Button */}
          {isActive && (
            <div className="pt-1 border-t border-gray-100">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <button
                  onClick={handlePlayClick}
                  disabled={isNavigating}
                  className={`w-full font-bold py-3 px-6 rounded-xl text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    replayMode
                      ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                  }`}
                >
                  {isNavigating ? (
                    <>
                      <span>Loading</span>
                      <span className="flex gap-1">
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        >
                          .
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        >
                          .
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                        >
                          .
                        </motion.span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" fill="currentColor" />
                      {getButtonText()}
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChallengeCard;
