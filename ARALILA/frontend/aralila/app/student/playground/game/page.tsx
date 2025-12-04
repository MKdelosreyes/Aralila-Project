"use client";

import React from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/bg/animatedforest-bg";

const StoryChainGame = dynamic(() => import("@/components/games/StoryChainGame"), { ssr: false });

export default function PlaygroundGamePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      <main className="relative z-10 flex items-start justify-center min-h-screen p-6 pt-24">
        <div className="w-full max-w-5xl bg-white/95 text-black rounded-xl shadow-2xl p-6">
          <StoryChainGame />
        </div>
      </main>
    </div>
  );
}
