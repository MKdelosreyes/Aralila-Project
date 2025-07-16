"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  User,
  BarChart3,
  BookOpen,
  Sparkles,
  Gamepad2,
  Settings,
} from "lucide-react";

import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import BentoBox from "@/components/student/bentobox";
import Header from "@/components/student/header";

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const studentName = "Alex";

  const bentoGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.08 },
    },
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden bg-black text-white">

      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} /> {/* this is the header */}
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} /> {/* mao ni ang menu nga mo slide2 */}

      {/* bg */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute inset-[-5%] w-[110%] h-[110%]"
          animate={{ x: ["0%", "-5%", "0%"], y: ["0%", "2%", "0%"] }}
          transition={{
            duration: 45,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          <Image
            src="/images/bg/forestbg-learn.jpg"
            alt="Forest Background"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <Sidebar />  {/* useable sidebar */}

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12">
        <motion.div
          variants={bentoGridVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-5xl grid grid-cols-4 gap-4 md:gap-6"
        >
          {/* Welcome Box */}
          <BentoBox className="col-span-4 md:col-span-2 md:row-span-2 justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, {studentName}!
              </h1>
              <p className="mt-2 text-slate-300">
                Ready to learn something new today?
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <User className="w-10 h-10 text-purple-400" />
              <div>
                <p className="font-semibold">Level 12</p>
                <p className="text-xs text-slate-400">Grammar Guru</p>
              </div>
            </div>
          </BentoBox>

          <BentoBox
            href="/student/challenges"
            className="col-span-2 md:col-span-1 group"
          >
            <BookOpen className="w-8 h-8 text-purple-400 mb-auto" />
            <h3 className="font-bold text-lg mt-2">Learn</h3>
            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              Start a new lesson
            </p>
          </BentoBox>

          <BentoBox
            href="/playground"
            className="col-span-2 md:col-span-1 group"
          >
            <Gamepad2 className="w-8 h-8 text-purple-400 mb-auto" />
            <h3 className="font-bold text-lg mt-2">Playground</h3>
            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              Test your skills
            </p>
          </BentoBox>

          <BentoBox className="col-span-4 md:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Overall Progress</h3>
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm text-slate-300 mb-3">
              You&apos;ve completed 75% of all modules.
            </p>
            <div className="w-full bg-black/30 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </BentoBox>

          <BentoBox className="col-span-4 md:col-span-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Recent Achievements</h3>
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <p className="flex items-center gap-2 text-slate-300">
                <span className="text-purple-400">🏆</span> Punctuation Pro
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <span className="text-purple-400">🏅</span> Spelling Bee Champ
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <span className="text-purple-400">✨</span> 5-Day Streak
              </p>
            </div>
          </BentoBox>

          <BentoBox href="#" className="col-span-4 md:col-span-1 group">
            <Settings className="w-8 h-8 text-purple-400 mb-auto" />
            <h3 className="font-bold text-lg mt-2">Settings</h3>
            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              Manage your account
            </p>
          </BentoBox>
        </motion.div>
      </main>
    </div>
  );
}
