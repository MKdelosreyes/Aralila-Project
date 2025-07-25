"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

interface EmojiChallengeIntroProps {
  onStartChallenge: () => void;
}

export const EmojiChallengeIntro = ({ onStartChallenge }: EmojiChallengeIntroProps) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Image
          src="/images/character/lila-normal.png"
          alt="Lila handa nang maglaro"
          width={250}
          height={250}
          className="mx-auto"
          priority
        />
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 mt-4">
          Kwento ng mga Emoji
        </h1>

        <div className="inline-block bg-purple-200 text-purple-800 text-base font-bold px-8 py-3 rounded-full shadow-md">
          Comprehension
        </div>
      </motion.div>

      <motion.div
        className="relative group flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-purple-400 rounded-full animate-pulse opacity-50"></div>
        </div>

        <motion.button
          onClick={onStartChallenge}
          className="relative z-10 rounded-full text-white shadow-2xl hover:shadow-purple-500/40 transition-shadow duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlayCircle className="w-32 h-32 text-white cursor-pointer" />
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ pointerEvents: "none" }}
          >
            Simulan
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};