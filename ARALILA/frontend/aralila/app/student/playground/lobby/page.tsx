"use client";

import React from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import Image from "next/image";
import { motion } from "framer-motion";

const Lobby = dynamic(() => import("@/components/games/Lobby"), { ssr: false });

export default function PlaygroundLobbyPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />

      <main className="relative z-10 flex items-start justify-center min-h-screen p-6 pt-24">
        {/* Big header (no white container) - title, description, and character on the background */}
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl text-white p-6 flex items-center gap-6 pointer-events-none"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="w-28 h-28 relative flex-shrink-0">
            <Image
              src="/images/character/lila-normal.png"
              alt="Lila ready to play"
              width={300}
              height={300}
              className="mx-auto"
            />
          </div>

          <div className="pointer-events-auto">
            <h1 className="text-7xl font-bold text-white mb-4 text-center">
              Story Chain Lobby
            </h1>

            <div className="flex items-center justify-center">
              <div className="inline-block bg-purple-200 text-purple-800 text-base font-bold px-8 py-3 rounded-full mb-2 shadow-md">
                STORY CHAIN
              </div>
            </div>

            <p className="text-lg text-white/90 mt-2 max-w-2xl text-center">
              Join a room with friends and build stories together — turn-based,
              timed, and fun!
            </p>
          </div>
        </motion.div>

        {/* smaller centered card for lobby controls */}
        <div className="w-full max-w-md bg-white/95 text-black rounded-xl shadow-xl p-6">
          <Lobby showHeader={false} />
        </div>
      </main>
    </div>
  );
}
