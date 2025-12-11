"use client";

import React from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/bg/animated-bg";
import Image from "next/image";
import { motion } from "framer-motion";

const Lobby = dynamic(() => import("@/components/games/Lobby"), { ssr: false });

export default function PlaygroundLobbyPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 md:p-6 pt-8 md:pt-12">
        {/* Top Decorative Element */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Image
            src="/images/overlays/story-chain_title.png"
            alt="Story Chain Title"
            width={400}
            height={120}
            className="w-auto h-auto max-w-xs md:max-w-sm object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>

        {/* Header Section with Glass Effect */}
        <motion.div
          className="w-full max-w-4xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 md:p-8 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-2xl -z-10"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Character Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-28 h-28 md:w-32 md:h-32 relative flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm"
            >
              <Image
                src="/images/character/lila-normal.png"
                alt="Lila ready to play"
                width={300}
                height={300}
                className="mx-auto drop-shadow-lg"
              />
            </motion.div>

            {/* Header Text */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 mb-2"
              >
                Game Lobby
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-sm md:text-base leading-relaxed mb-3"
              >
                Gather your creative crew and prepare for an epic story adventure
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center md:justify-start gap-2"
              >
                <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/50 text-xs text-purple-200 font-medium">
                  🎯 Real-time
                </span>
                <span className="px-3 py-1 rounded-full bg-pink-500/30 border border-pink-400/50 text-xs text-pink-200 font-medium">
                  🚀 Ready to play
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/50 text-xs text-purple-200 font-medium">
                  ✨ Exciting
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Lobby Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <Lobby showHeader={false} />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
