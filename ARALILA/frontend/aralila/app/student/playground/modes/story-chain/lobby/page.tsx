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

      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-6 pt-16">
        {/* Header - placed in normal flow for better responsiveness */}
        <motion.div
          className="w-full max-w-5xl text-white p-6 flex flex-col md:flex-row items-center gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="w-24 h-24 relative flex-shrink-0">
            <Image src="/images/character/lila-normal.png" alt="Lila ready to play" width={300} height={300} className="mx-auto" />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">Story Chain Lobby</h1>

            <div className="flex items-center justify-center md:justify-start">
              <div className="inline-block bg-purple-200 text-purple-800 text-sm font-bold px-6 py-2 rounded-full mb-2 shadow-md">
                STORY CHAIN
              </div>
            </div>

            <p className="text-base md:text-lg text-white/90 mt-2 max-w-2xl">Join a room with friends and build stories together — turn-based, timed, and fun!</p>
          </div>
        </motion.div>

        {/* centered card for lobby controls */}
        <div className="w-full mt-6 flex justify-center">
          <div className="w-full max-w-md bg-white/95 text-black rounded-xl shadow-xl p-6">
            <Lobby showHeader={false} />
          </div>
        </div>
      </main>
    </div>
  );
}
