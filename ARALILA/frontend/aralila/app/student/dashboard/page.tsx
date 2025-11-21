"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, TrendingUp, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { useAreaUnlocks } from "@/hooks/useAreaUnlocks";
import { useAuth } from "@/contexts/AuthContext";

interface Area {
  id: number;
  name: string;
  is_locked: boolean;
  order_index: number;
  completed_games: number;
  total_games: number;
  average_score: number;
  message: string;
}

interface UserData {
  first_name: string;
  last_name: string;
  profile_pic?: string;
  email?: string;
}

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {
    unlockedAreas,
    isAreaLocked,
    getAreaProgress,
    loading: progressLoading,
  } = useAreaUnlocks();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchAreas();
    }
  }, [user, authLoading]);

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No authentication token found");
        router.push("/login");
        return;
      }

      const response = await fetch(`${env.backendUrl}/api/games/areas/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.error("Token is invalid or expired");
        localStorage.removeItem("access_token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch areas: ${response.status}`);
      }

      const data = await response.json();
      setAreas(data.areas);
    } catch (error) {
      console.error("Error fetching areas:", error);

      // Fallback data
      setAreas([
        {
          id: 1,
          name: "Playground",
          is_locked: false,
          order_index: 0,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Start your journey here!",
        },
        {
          id: 2,
          name: "Classroom",
          is_locked: true,
          order_index: 1,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Complete Playground to unlock",
        },
        {
          id: 3,
          name: "Dinner Table",
          is_locked: true,
          order_index: 2,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Complete Classroom to unlock",
        },
        {
          id: 4,
          name: "Town Market",
          is_locked: true,
          order_index: 3,
          completed_games: 0,
          total_games: 6,
          average_score: 0,
          message: "Complete Town Market to unlock",
        },
        {
          id: 5,
          name: "Mountain",
          is_locked: true,
          order_index: 4,
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

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "well-prepared":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "ready":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const getReadinessLabel = (readiness: string) => {
    switch (readiness) {
      case "well-prepared":
        return "🎯 Well Prepared!";
      case "ready":
        return "✅ Ready to Try";
      default:
        return "📚 Practice More";
    }
  };

  if (loading || progressLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading your journey...</p>
        </div>
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
          <h1 className="text-4xl font-bold mb-4 text-center">
            Your Learning Journey
          </h1>
          <p className="text-gray-400 text-center mb-4">
            Complete assessments to unlock new areas. Practice in Challenges
            first!
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">Areas Unlocked</p>
              <p className="text-2xl font-bold text-purple-400">
                {unlockedAreas.length}/5
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">Total Progress</p>
              <p className="text-2xl font-bold text-blue-400">
                {Math.round((unlockedAreas.length / 5) * 100)}%
              </p>
            </div>
          </div>

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
                const locked = isAreaLocked(area.order_index);
                const progress = getAreaProgress(area.order_index);
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
                    className="flex flex-col items-center w-32"
                  >
                    {/* Node Display */}
                    <motion.div
                      whileHover={!locked ? { scale: 1.1 } : {}}
                      className={`relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-4 shadow-xl transition-all ${
                        locked
                          ? "bg-gray-600 border-gray-700 opacity-50 cursor-not-allowed"
                          : isComplete
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-600 shadow-yellow-500/50 cursor-pointer"
                          : "bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-600 shadow-blue-500/50 cursor-pointer"
                      }`}
                    >
                      {/* Lock Icon */}
                      {locked && <Lock className="text-gray-300" size={32} />}

                      {/* Completion Badge */}
                      {!locked && isComplete && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 border-2 border-white"
                        >
                          <CheckCircle className="text-white" size={16} />
                        </motion.div>
                      )}

                      {/* Area Number */}
                      {!locked && (
                        <span className="text-2xl font-bold text-white">
                          {area.id}
                        </span>
                      )}
                    </motion.div>

                    {/* Area Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                      className="mt-4 text-center w-full"
                    >
                      <p className="text-sm md:text-base font-bold">
                        {area.name}
                      </p>

                      {locked ? (
                        <p className="text-xs text-gray-500 mt-1">🔒 Locked</p>
                      ) : (
                        <>
                          {/* Readiness Indicator */}
                          {progress && !progress.assessmentPassed && (
                            <div className="mt-2 space-y-1">
                              <div
                                className={`text-[10px] px-2 py-1 rounded-full border inline-block ${getReadinessColor(
                                  progress.recommendedReadiness
                                )}`}
                              >
                                {getReadinessLabel(
                                  progress.recommendedReadiness
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400">
                                {progress.challengesPracticed}/6 practiced
                              </p>

                              {/* Practice Button */}
                              <button
                                onClick={() =>
                                  router.push(
                                    `/student/challenges?area=${area.order_index}`
                                  )
                                }
                                className="text-[10px] text-purple-400 hover:text-purple-300 underline flex items-center justify-center gap-1 mx-auto mt-1"
                              >
                                <BookOpen size={10} />
                                Practice
                              </button>
                            </div>
                          )}

                          {progress?.assessmentPassed && (
                            <p className="text-xs text-green-400 mt-1">
                              ✓ Completed
                            </p>
                          )}

                          {!progress && (
                            <p className="text-xs text-gray-500 mt-1">
                              Not Started
                            </p>
                          )}
                        </>
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
