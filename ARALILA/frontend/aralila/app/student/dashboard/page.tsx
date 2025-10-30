"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";

interface Area {
  id: number;
  name: string;
  is_locked: boolean;
  completed_games: number;
  total_games: number;
  average_score: number;
  message: string;
}

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("No token found, redirecting to login");
      router.push("/login");
      return;
    }

    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No authentication token found");
        router.push("/login");
        return;
      }

      console.log("Fetching areas with token:", token.substring(0, 20) + "..."); // Debug log

      const response = await fetch(`${env.backendUrl}/api/games/areas/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status); // Debug log

      if (response.status === 401) {
        console.error("Token is invalid or expired");
        localStorage.removeItem("access_token"); // Clear invalid token
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch areas: ${response.status}`);
      }

      const data = await response.json();
      console.log("Areas fetched:", data); // Debug log
      setAreas(data.areas);
    } catch (error) {
      console.error("Error fetching areas:", error);

      // Fallback to mock data for development
      setAreas([
        {
          id: 1,
          name: "Playground",
          is_locked: false,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Start your journey here!",
        },
        {
          id: 2,
          name: "Classroom",
          is_locked: true,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Complete Playground to unlock",
        },
        {
          id: 3,
          name: "Dinner Table",
          is_locked: true,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Complete Classroom to unlock",
        },
        {
          id: 4,
          name: "Town Market",
          is_locked: true,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Complete Dinner Table to unlock",
        },
        {
          id: 5,
          name: "Mountain",
          is_locked: true,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Complete Town Market to unlock",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = (area: Area) => {
    if (!area.is_locked) {
      router.push(`/student/challenges/${area.id}`);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
        <p>Loading areas...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <AnimatedBackground />
      <Sidebar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12">
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold mb-12 text-center">
            Your Learning Journey
          </h1>

          {/* Level Map Container */}
          <div className="relative w-full py-12">
            {/* Glowing Connection Line */}
            <svg
              className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2"
              style={{ zIndex: 0 }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <motion.line
                x1="10%"
                y1="50%"
                x2="90%"
                y2="50%"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="3"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>

            {/* Area Nodes */}
            <div
              className="relative flex justify-between items-center px-12"
              style={{ zIndex: 1 }}
            >
              {areas.map((area, index) => {
                const isComplete = area.completed_games === area.total_games;

                return (
                  <motion.div
                    key={area.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="flex flex-col items-center"
                  >
                    {/* Node Button */}
                    <motion.button
                      onClick={() => handleAreaClick(area)}
                      disabled={area.is_locked}
                      whileHover={area.is_locked ? {} : { scale: 1.1 }}
                      whileTap={area.is_locked ? {} : { scale: 0.95 }}
                      className={`relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-4 shadow-xl transition-all
                        ${
                          area.is_locked
                            ? "bg-gray-600 border-gray-700 cursor-not-allowed opacity-50"
                            : isComplete
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-600 shadow-yellow-500/50"
                            : "bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-600 shadow-blue-500/50 hover:shadow-blue-500/80"
                        }`}
                    >
                      {/* Lock Icon */}
                      {area.is_locked && (
                        <Lock className="text-gray-300" size={32} />
                      )}

                      {/* Completion Badge */}
                      {!area.is_locked && isComplete && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 border-2 border-white"
                        >
                          <CheckCircle className="text-white" size={16} />
                        </motion.div>
                      )}

                      {/* Area Number */}
                      {!area.is_locked && (
                        <span className="text-2xl font-bold text-white">
                          {area.id}
                        </span>
                      )}
                    </motion.button>

                    {/* Area Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                      className="mt-4 text-center"
                    >
                      <p className="text-sm md:text-base font-bold">
                        {area.name}
                      </p>
                      {!area.is_locked && (
                        <>
                          <p className="text-xs text-gray-400 mt-1">
                            {area.completed_games}/{area.total_games} games
                          </p>
                          {area.completed_games > 0 && (
                            <p className="text-xs text-blue-400 font-semibold">
                              {area.average_score}% avg
                            </p>
                          )}
                        </>
                      )}
                      {area.is_locked && (
                        <p className="text-xs text-gray-500 mt-1">
                          {area.message}
                        </p>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
