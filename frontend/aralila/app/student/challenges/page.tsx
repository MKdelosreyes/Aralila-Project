"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
        <div className="min-h-screen absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* carousel */}
      <CardCarousel />
    </div>
  );
}
