"use client";

import React from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/bg/animated-bg";
import Image from "next/image";
import { motion } from "framer-motion";

const StoryChainGame = dynamic(() => import("@/components/games/StoryChainGame"), { ssr: false });

export default function PlaygroundGamePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 md:p-6 pt-6 md:pt-12">
        {/* Top Decorative Title */}
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

        {/* Main Game Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-5xl"
        >
          {/* Gradient Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20 rounded-3xl blur-3xl -z-10"></div>

          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-purple-500/15 to-transparent rounded-full blur-3xl -z-5"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-pink-500/15 to-transparent rounded-full blur-3xl -z-5"></div>

            <div className="relative z-10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
              <StoryChainGame />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
