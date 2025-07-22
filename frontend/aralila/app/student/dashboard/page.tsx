"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";

import ProfileCard from "@/components/student/dashboard/profile-card";
import ClassroomCard from "@/components/student/dashboard/classroom-card";
import TodoListCard from "@/components/student/dashboard/todolist-card";

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const student = {
    firstName: "Alex",
    fullName: "Alexandra dela Cruz",
    avatar: "/images/avatars/student-avatar.png",
  };

  const bentoGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* bg */}
      <AnimatedBackground />

      <Sidebar />

      <main className="relative z-10 flex flex-col items-center min-h-screen p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12">
        <motion.div
          variants={bentoGridVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 auto-rows-[12rem] gap-4 md:gap-6"
        >

          <ProfileCard student={student} />
          
          <ClassroomCard />
          
          <TodoListCard />


        </motion.div>
      </main>
    </div>
  );
}