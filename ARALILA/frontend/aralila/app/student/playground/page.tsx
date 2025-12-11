"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import AnimatedBackground from "@/components/bg/animated-bg";
import Link from "next/link";
import { ChevronRight, Sparkles, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function PlaygroundHome() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 flex flex-col min-h-screen px-6 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold uppercase text-xs tracking-wider transition-colors group"
          >
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto" />
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Playground
            </h1>
            <p className="text-lg md:text-xl text-white/80">
              Choose a game mode to play — invite friends, compete, and have fun.
            </p>
          </motion.div>

          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch w-full"
          >
            {/* Story Chain Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              tabIndex={0}
              onClick={() =>
                router.push("/student/playground/modes/story-chain")
              }
              className="group relative flex flex-col justify-between rounded-2xl overflow-hidden border border-white/20 backdrop-blur-xl bg-white/10 p-10 shadow-2xl cursor-pointer min-h-[400px]"
            >
              {/* Glassmorphism gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />

              <div className="relative z-10 flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Multiplayer</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Story Chain
                  </h3>
                  <p className="text-base md:text-lg text-white/70">
                    Take turns adding words or short phrases to build a sentence
                    based on the image.
                  </p>
                </div>

                <motion.div
                  className="w-32 h-32 relative hidden md:block flex-shrink-0"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/images/character/lila-pencil.png"
                    alt="Lila with pencil"
                    fill
                    sizes="(max-width: 768px) 120px, 128px"
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              <div className="relative z-10 mt-8 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-shadow"
                >
                  Play Now
                </motion.button>
                <div className="flex items-center gap-2 text-base text-white/60">
                  <Users className="w-5 h-5" />
                  2–3 players
                </div>
              </div>
            </motion.div>

            {/* Filipino Wordle Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              tabIndex={0}
              onClick={() =>
                router.push("/student/playground/modes/filipino-wordle")
              }
              className="group relative flex flex-col justify-between rounded-2xl overflow-hidden border border-white/20 backdrop-blur-xl bg-white/10 p-10 shadow-2xl cursor-pointer min-h-[400px]"
            >
              {/* Glassmorphism gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />

              <div className="relative z-10 flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Daily Challenge</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Filipino Wordle
                  </h3>
                  <p className="text-base md:text-lg text-white/70">
                    Guess the Filipino word — daily puzzles and word practice.
                  </p>
                </div>

                <motion.div
                  className="w-32 h-32 relative hidden md:block flex-shrink-0"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/images/character/lila-computer.png"
                    alt="Lila on computer"
                    fill
                    sizes="(max-width: 768px) 120px, 128px"
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              <div className="relative z-10 mt-8 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-shadow"
                >
                  Play Now
                </motion.button>
                <div className="text-base text-white/60">Solo / Practice</div>
              </div>
            </motion.div>

            {/* Locked Card */}
            <motion.div
              variants={cardVariants}
              className="relative flex flex-col justify-between rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl bg-white/5 p-10 shadow-2xl min-h-[400px]"
            >
              {/* Animated lock icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute top-6 right-6 text-purple-400/50"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </motion.div>

              <div className="relative z-10 flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400/50" />
                    <span className="text-xs font-bold text-purple-400/50 uppercase tracking-wider">Coming Soon</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white/60 mb-4">
                    Mystery Mode
                  </h3>
                  <p className="text-base md:text-lg text-white/40">
                    More game modes coming soon — stay tuned!
                  </p>
                </div>

                <div className="w-32 h-32 relative hidden md:block flex-shrink-0 opacity-30 grayscale">
                  <Image
                    src="/images/character/lila-normal.png"
                    alt="Lila"
                    fill
                    sizes="(max-width: 768px) 120px, 128px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="relative z-10 mt-8 flex items-center justify-between">
                <div className="px-8 py-4 rounded-xl font-bold text-white/40 border border-white/10">
                  Locked
                </div>
                <div className="text-base text-white/40">—</div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}