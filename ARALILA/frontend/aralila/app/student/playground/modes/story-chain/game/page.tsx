"use client";

import React from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/bg/animated-bg";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const StoryChainGame = dynamic(() => import("@/components/games/StoryChainGame"), { ssr: false });

export default function PlaygroundGamePage() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      {/* Back Button - fixed top-left */}
      <button
        onClick={() => router.push("/student/playground/modes/story-chain/lobby" + window.location.search)}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-purple-400 text-gray-700 hover:text-purple-700 font-medium transition-all shadow-sm hover:shadow-md"
      >
        <ArrowLeft size={20} />
        <span>Back to Lobby</span>
      </button>

      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 md:p-6 pt-6 md:pt-12">
        {/* Title Image - Pop out effect */}
        <div className="relative z-20 mb-[-50px] md:mb-[-60px]">
          <div className="relative">
            <Image
              src="/images/overlays/story-chain_title.png"
              alt="Story Chain Title"
              width={500}
              height={200}
              className="w-auto h-auto max-w-[250px] md:max-w-[350px] object-contain drop-shadow-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-transparent to-transparent blur-xl -z-10"></div>
          </div>
        </div>

        {/* White Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 pt-16 md:pt-20"
        >
          <StoryChainGame />
        </motion.div>
      </main>
    </div>
  );
}
