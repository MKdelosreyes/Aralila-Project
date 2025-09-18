"use client";

<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
import React, { useState } from "react";
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
import { motion } from "framer-motion";

import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
<<<<<<< HEAD
import { authAPI } from "@/lib/api/auth";

import ClassroomCard from "@/components/student/dashboard/classroom-card";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  school_name: string;
  profile_pic: string;
  role: string;
}

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authAPI.getProfile();
        console.log("Retrieved user profile successfully...");
        setUser(userData);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

=======

import ClassroomCard from "@/components/student/dashboard/classroom-card";


export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);

>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
  const bentoGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
<<<<<<< HEAD
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} user={user} />
=======
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* bg */}
      <AnimatedBackground />

      <Sidebar />

      <main className="relative z-10 flex flex-col items-center min-h-screen p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12">
        <motion.div
          variants={bentoGridVariants}
          initial="hidden"
          animate="visible"
          // Removed auto-rows-[12rem] to allow cards to dictate their own height
          className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          <ClassroomCard />
        </motion.div>
      </main>
    </div>
  );
}
