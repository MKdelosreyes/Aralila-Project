"use client";

import AnimatedBackground from "../bg/animated-bg";
import Sidebar from "../student/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/analytics/StatCard";
import { SkillMasteryChart } from "@/components/analytics/SkillMasteryChart";
import { ImprovementChart } from "@/components/analytics/ImprovementChart";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { DifficultyProgress } from "@/components/analytics/DifficultyProgress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

export function AnalyticsModal() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useAnalytics();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />
      <Sidebar />

      <div className="relative w-[70%] mx-auto mt-20 z-10">
        <div
          className="relative h-[75vh] rounded-3xl overflow-visible
          bg-gradient-to-br from-white/10 via-purple-500/5 to-white/5
          backdrop-blur-md backdrop-saturate-50
          border-15 border-purple-300
          shadow-[0_8px_32px_0_rgba(168,85,247,0.37)]
          before:absolute before:inset-0 before:rounded-3xl 
          before:bg-gradient-to-tr before:from-transparent before:via-white/10 before:to-transparent 
          before:pointer-events-none"
        >
          {/* Header - Positioned on top border */}
          {/* <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
            <h1 className="text-3xl font-bold text-yellow-400 bg-clip-text px-8 py-3 backdrop-blur-md bg-white/20 rounded-3xl border-2 border-purple-300 shadow-lg whitespace-nowrap">
              Pagsusuri ng Pagganap
            </h1>
          </div> */}

          <div className="relative flex flex-col lg:flex-row gap-6 p-6 h-full">
            {/* Skill Mastery Radar - Left Side */}
            <div className="flex-1 h-full">
              <SkillMasteryChart mastery={data.skillMastery} />
            </div>

            {/* Stats Cards - Right Side */}
            <div className="flex-1 h-full ">
              <div className="grid grid-cols-2 gap-4 h-full">
                <StatCard
                  title="Total Stars"
                  value={data.overview.totalStarsEarned}
                  icon="⭐"
                  subtitle={`from ${data.overview.totalGamesPlayed} games`}
                />
                <StatCard
                  title="Games Played"
                  value={data.overview.totalGamesPlayed}
                  icon="🎮"
                  subtitle={`${data.overview.areasUnlocked} areas unlocked`}
                />
                <StatCard
                  title="Current Streak"
                  value={data.overview.currentStreak}
                  icon="🔥"
                  subtitle={`Longest: ${data.overview.longestStreak} days`}
                  trend={data.overview.currentStreak >= 3 ? "up" : "neutral"}
                />
                <StatCard
                  title="Total Time"
                  value={`${data.timeAnalytics.total_time_minutes}m`}
                  icon="⏱️"
                  subtitle={`${data.timeAnalytics.total_sessions} sessions`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
