"use client";

import React, { useState } from "react";

import CardCarousel from "@/components/student/challenges/cardcarousel";
import Header from "@/components/student/header";
import FullMenuScreen from "@/components/student/fullscreen-menu";
import AnimatedBackground from "@/components/bg/animatedforest-bg";

export default function StudentChallengesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullMenuScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* bg */}
      <AnimatedBackground />

      {/* carousel */}
      <CardCarousel />
    </div>
  );
}
