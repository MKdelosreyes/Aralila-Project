"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animated-bg";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const badges = [
    { id: 1, name: "3D", icon: "/images/badges/3days.png", requiredPoints: 3 },
    { id: 2, name: "5D", icon: "/images/badges/5days.png", requiredPoints: 5 },
    {
      id: 3,
      name: "30D",
      icon: "/images/badges/30days.png",
      requiredPoints: 30,
    },
    {
      id: 4,
      name: "100D",
      icon: "/images/badges/100days.png",
      requiredPoints: 100,
    },
    {
      id: 5,
      name: "200D",
      icon: "/images/badges/200days.png",
      requiredPoints: 200,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Navigation & Background */}
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />
      <Sidebar />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-28 md:pt-32 md:pl-24 md:pr-8">
        {/* Unified Card: Profile + Badges */}
        <div className="w-full max-w-screen-xl bg-gray-900/70 backdrop-blur-xl p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl text-center flex flex-col items-center gap-10">
          {/* Profile Section */}
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <img
              src={user.profile_pic || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full border-4 border-purple-400 shadow-xl object-cover"
            />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg break-all">
              {user.email}
            </p>
            {user.school_name && (
              <p className="text-purple-300 text-sm sm:text-base md:text-xl break-all">
                {user.school_name}
              </p>
            )}
            <div className="mt-4 p-4 sm:p-6 md:p-8 rounded-3xl bg-purple-500/20 border border-purple-400/40">
              <p className="text-lg sm:text-xl md:text-3xl font-semibold">
                🔥 Login Streak Points
              </p>
              <p className="text-3xl sm:text-4xl md:text-6xl font-bold text-purple-300 mt-1">
                {user.ls_points || 0}
              </p>
            </div>
          </div>

          {/* Badges Section */}
          <div className="w-full overflow-x-auto pb-2 no-scrollbar px-2">
            <div className="flex flex-nowrap justify-start gap-3 sm:gap-4">
              {badges.map((badge) => {
                const badgeData = user.collected_badges?.find(
                  (b: any) =>
                    b.id === badge.id.toString() && b.status === "claimed"
                );
                const unlocked = !!badgeData;

                return (
                  <div
                    key={badge.id}
                    className={`flex-shrink-0 w-28 sm:w-36 md:w-44 lg:w-52 flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 py-4 sm:px-5 sm:py-5 rounded-2xl border transition ${
                      unlocked
                        ? "bg-purple-500/20 border-purple-400"
                        : "bg-white/5 border-white/10 opacity-50"
                    }`}
                  >
                    <img
                      src={badge.icon}
                      alt={badge.name}
                      className={`w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain transition ${
                        unlocked ? "filter-none" : "grayscale opacity-40"
                      }`}
                    />
                    <span className="text-xs sm:text-sm md:text-base font-medium text-center">
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
