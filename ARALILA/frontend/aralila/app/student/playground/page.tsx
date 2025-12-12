"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import AnimatedBackground from "@/components/bg/animated-bg";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PlaygroundHome() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleNavigation = (path: string, key: string) => {
    setLoading(key);
    router.push(path);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      {/* Back Button */}
      <motion.button
        onClick={() => router.push("/student/dashboard")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </motion.button>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="w-full max-w-6xl">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4 text-center">
            Playground
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 text-center">
            Choose a game mode to play — invite friends, compete, and have fun.
          </p>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Story Chain Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                handleNavigation(
                  "/student/playground/modes/story-chain",
                  "story-chain"
                )
              }
              className="group relative flex flex-col justify-between rounded-2xl overflow-hidden border border-gray-800 bg-gradient-to-b from-white/80 to-white/70 p-8 shadow-2xl hover:scale-[1.02] transition"
            >
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Story Chain
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mt-3">
                    Take turns adding words or short phrases to build a sentence
                    based on the image.
                  </p>
                </div>

                <div className="w-28 h-28 relative hidden md:block flex-shrink-0">
                  <Image
                    src="/images/character/lila-pencil.png"
                    alt="Lila with pencil"
                    fill
                    sizes="(max-width: 768px) 120px, 112px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  disabled={loading === "story-chain"}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3 rounded-lg font-semibold shadow-lg hover:brightness-105 transition disabled:opacity-70"
                >
                  {loading === "story-chain" ? "Loading..." : "Play"}
                </button>
                <div className="text-sm text-gray-500">2–3 players</div>
              </div>
            </div>

            {/* Filipino Wordle Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                handleNavigation(
                  "/student/playground/modes/filipino-wordle",
                  "filipino-wordle"
                )
              }
              className="group relative flex flex-col justify-between rounded-2xl overflow-hidden border border-gray-800 bg-gradient-to-b from-white/80 to-white/70 p-8 shadow-2xl hover:scale-[1.02] transition"
            >
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Filipino Wordle
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mt-3">
                    Guess the Filipino word — daily puzzles and word practice.
                  </p>
                </div>

                <div className="w-28 h-28 relative hidden md:block flex-shrink-0">
                  <Image
                    src="/images/character/lila-computer.png"
                    alt="Lila on computer"
                    fill
                    sizes="(max-width: 768px) 120px, 112px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  disabled={loading === "filipino-wordle"}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3 rounded-lg font-semibold shadow-lg hover:brightness-105 transition disabled:opacity-70"
                >
                  {loading === "filipino-wordle" ? "Loading..." : "Play"}
                </button>
                <div className="text-sm text-gray-500">Solo / Practice</div>
              </div>
            </div>

            {/* Locked Card */}
            <div className="relative flex flex-col justify-between rounded-2xl overflow-hidden border border-gray-800 bg-white/5 p-8 shadow-2xl opacity-80">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-white/90">
                    Locked
                  </h3>
                  <p className="text-sm md:text-base text-white/60 mt-3">
                    More game modes coming soon — stay tuned!
                  </p>
                </div>

                <div className="w-28 h-28 relative hidden md:block flex-shrink-0 opacity-30">
                  <Image
                    src="/images/character/lila-normal.png"
                    alt="Lila"
                    fill
                    sizes="(max-width: 768px) 120px, 112px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="px-4 py-2 rounded-lg font-semibold text-gray-400">
                  Coming Soon
                </div>
                <div className="text-sm text-gray-500">—</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
