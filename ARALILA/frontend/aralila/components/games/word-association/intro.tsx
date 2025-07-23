"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

interface WordAssociationIntroProps {
  onStartChallenge: () => void;
}

export const WordAssociationIntro = ({ onStartChallenge }: WordAssociationIntroProps) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-screen overflow-hidden">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Image
          src="/images/character/lila-normal.png" // Adjust path as needed
          alt="Lila ready to play"
          width={300}
          height={300}
          className="mx-auto"
        />
        <h1 className="text-6xl font-bold text-white mb-4">Apat na Larawan, Isang Salita</h1>
        <div className="inline-block bg-purple-200 text-purple-800 text-base font-bold px-8 py-3 rounded-full mb-2 shadow-md">
          WORD ASSOCIATION
        </div>
      </motion.div>

      <motion.div
        className="relative group flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
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
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ pointerEvents: "none" }}
          >
            Start
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};