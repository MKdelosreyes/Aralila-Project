"use client";

import React, { useState } from "react";
import CardCarousel from "@/components/student/challenges/cardcarousel";
import Header from "@/components/student/header";
import FullMenuScreen from "@/components/student/fullscreen-menu";
import Image from "next/image";

export default function StudentChallengesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullMenuScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* bg */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-[-5%] w-[110%] h-[110%] animate-slowPan">
          <Image
            src="/images/bg/forestbg-learn.jpg"
            alt="Forest Background"
            fill
            priority
            className="object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* carousel */}
      <CardCarousel />
    </div>
  );
}
