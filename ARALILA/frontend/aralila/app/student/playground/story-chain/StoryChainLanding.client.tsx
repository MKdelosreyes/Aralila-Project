"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AnimatedBackground from "@/components/bg/animated-bg";

export default function StoryChainLanding() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const player = searchParams.get("player") || "Player";
  const room = searchParams.get("room") || "DEFAULT";

  const goToGame = () => {
    router.push(
      `/student/playground/game?player=${encodeURIComponent(player)}&room=${encodeURIComponent(room)}`
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      <main className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl bg-white/95 text-black rounded-xl shadow-2xl p-6 text-center">
          <h1 className="text-2xl font-bold text-purple-700 mb-2">📚 Story Chain</h1>
          <p className="text-sm text-gray-600 mb-4">Take turns adding words or short phrases to build a sentence based on the image.</p>

          <div className="space-y-3">
            <p className="text-sm">Player: <strong>{player}</strong></p>
            <p className="text-sm">Room: <strong>{room}</strong></p>

            <div className="flex gap-3 justify-center mt-4">
              <button onClick={goToGame} className="py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">Join Game</button>
              <button onClick={() => router.push('/student/playground')} className="py-3 px-6 bg-purple-100 text-purple-700 rounded-lg border border-purple-300">Back</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
