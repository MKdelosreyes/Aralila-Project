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
  };
  isActive: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ card, isActive }) => {
  const scale = isActive ? 1.05 : 0.75;
  const opacity = isActive ? 1 : 0.3;

  return (
    <div className="w-[352px] h-[32rem] flex-shrink-0" aria-hidden={!isActive}>
      <motion.div
        animate={{ scale, opacity }}
        whileHover={isActive ? { scale: 1.1 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`w-full h-full rounded-[2rem] bg-white overflow-hidden flex flex-col transition-shadow duration-500 ${
          isActive
            ? "shadow-[0px_0px_30px_-5px_rgba(168,85,247,0.4)]"
            : "shadow-xl"
        }`}
      >
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
        <div className="flex flex-col flex-grow p-5 pt-3">
          <div className="flex-grow">
            <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              {card.category}
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight">
              {card.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {card.description}
            </p>
          </div>
          {isActive && (
            <div className="mt-5 pt-3 border-t border-gray-100">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Link href={`/student/challenges/games/${card.slug}`}>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
                    <Play className="w-4 h-4" fill="currentColor" />
                    Start Challenge
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
