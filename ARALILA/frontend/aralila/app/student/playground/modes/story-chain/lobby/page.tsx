"use client";

import React from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/bg/animated-bg";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const Lobby = dynamic(() => import("@/components/games/Lobby"), { ssr: false });

export default function PlaygroundLobbyPage() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      {/* Back Button - fixed top-left */}
      <button
        onClick={() => router.push("/student/playground/modes/story-chain")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-purple-400 text-gray-700 hover:text-purple-700 font-medium transition-all shadow-sm hover:shadow-md"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 md:p-6 pt-8 md:pt-12">
        {/* Title Image - Pop out effect */}
        <div className="relative z-20 mb-[-60px] md:mb-[-70px]">
          <div className="relative">
            <Image
              src="/images/overlays/story-chain_title.png"
              alt="Story Chain Title"
              width={500}
              height={200}
              className="w-auto h-auto max-w-[300px] md:max-w-[450px] object-contain drop-shadow-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-transparent to-transparent blur-xl -z-10"></div>
          </div>
        </div>

        {/* White Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 md:p-10 pt-20 md:pt-24"
        >
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              {/* Character Circle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-24 h-24 md:w-28 md:h-28 relative flex-shrink-0 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 flex items-center justify-center shadow-lg"
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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Game Lobby
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Gather your creative crew and prepare for an epic story adventure
                </p>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium border border-purple-200">
                <Zap size={14} />
                Real-time
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-medium border border-pink-200">
                <Users size={14} />
                Multiplayer
              </span>
            </div>
          </div>

          {/* Lobby Component */}
          <div className="relative">
            <Lobby showHeader={false} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
