"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  Star,
  Zap,
  Shield,
  Gem,
  ChevronRight,
  Swords,
  BookOpen,
  Sparkles,
  Loader2,
} from "lucide-react";
import AnimatedBackground from "@/components/bg/animated-bg";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// --- Types ---
interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  unlocked: boolean;
  status: string;
}

interface UserData {
  username: string;
  level: number;
  title: string;
  xp: number;
  maxXp: number;
  streak: number;
  gems: number;
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  collectedBadges: Array<{ id: string; status: string }>;
}

// Badge definitions
const BADGE_DEFINITIONS: Record<
  string,
  { title: string; desc: string; icon: React.ReactNode }
> = {
  "1": {
    title: "3-Day Streak",
    desc: "Login for 3 days",
    icon: <Flame size={20} />,
  },
  "2": {
    title: "5-Day Streak",
    desc: "Login for 5 days",
    icon: <Swords size={20} />,
  },
  "3": {
    title: "30-Day Streak",
    desc: "Login for 30 days",
    icon: <Zap size={20} />,
  },
  "4": {
    title: "100-Day Streak",
    desc: "Login for 100 days",
    icon: <Shield size={20} />,
  },
  "5": {
    title: "200-Day Streak",
    desc: "Login for 200 days",
    icon: <Trophy size={20} />,
  },
};

const TAGALOG_QUOTES = [
  "Kaya mo 'yan, kaibigan! Laban lang!",
  "Ang galing mo! Tuloy-tuloy lang!",
  "Huwag kang susuko, malayo pa ang mararating mo.",
  "Bawat hakbang, mahalaga. Padayon!",
  "Naniniwala ako sa kakayahan mo!",
  "Magpahinga kung pagod, pero 'wag hihinto.",
  "Isa kang lodi! Keep it up!",
];

const WORD_OF_THE_DAY = {
  word: "Hiraya",
  pronunciation: "/hi-ra-ya/",
  meaning: "Fruit of one's hopes, dreams, and aspirations.",
  example: "May hiraya manawari.",
};

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<"stats" | "badges">("stats");
  const [quote, setQuote] = useState(TAGALOG_QUOTES[0]);
  const [fadeQuote, setFadeQuote] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get Supabase session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error("Not authenticated");
        }

        // Call Django backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile/`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        // Transform backend data to frontend format
        setUserData({
          username: data.full_name || data.email.split("@")[0],
          level: Math.floor(data.ls_points / 10) + 1, // Simple level calculation
          title: "Forest Explorer",
          xp: (data.ls_points % 10) * 300,
          maxXp: 3000,
          streak: data.ls_points,
          gems: data.ls_points * 100,
          avatarUrl: data.profile_pic || "/images/meerkat.png",
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          schoolName: data.school_name,
          collectedBadges: data.collected_badges || [],
        });
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Convert collected badges to achievements
  const achievements: Achievement[] = userData
    ? Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => {
        const collected = userData.collectedBadges.find((b) => b.id === id);
        return {
          id,
          ...badge,
          unlocked: !!collected,
          status: collected?.status || "locked",
        };
      })
    : [];

  // XP Calculation
  const xpPercentage = userData ? (userData.xp / userData.maxXp) * 100 : 0;

  // Randomize Quote Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeQuote(true);
      setTimeout(() => {
        const randomQuote =
          TAGALOG_QUOTES[Math.floor(Math.random() * TAGALOG_QUOTES.length)];
        setQuote(randomQuote);
        setFadeQuote(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Loading Screen
  if (loading) {
    return (
      <div className="h-screen w-full relative overflow-hidden font-sans flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <AnimatedBackground />
          <div className="absolute inset-0 bg-indigo-950/20 pointer-events-none" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
          <p className="text-white text-lg font-semibold">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !userData) {
    return (
      <div className="h-screen w-full relative overflow-hidden font-sans flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <AnimatedBackground />
          <div className="absolute inset-0 bg-indigo-950/20 pointer-events-none" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="text-red-400 text-6xl">⚠️</div>
          <p className="text-white text-xl font-semibold">
            Failed to load profile
          </p>
          <p className="text-slate-300 text-sm">{error || "Unknown error"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans flex items-center justify-center">
      {/* --- Background Layer --- */}
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
        <div className="absolute inset-0 bg-indigo-950/20 pointer-events-none" />
      </div>

      {/* --- Back Button --- */}
      <button
        onClick={() => router.push("/student/dashboard")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-full text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm">Back to Dashboard</span>
      </button>

      <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col md:flex-row items-end md:items-center justify-between px-4 pb-0 md:pb-0">
        {/* --- LEFT SIDE: Lila & Speech Bubble --- */}
        <div className="hidden md:flex flex-1 h-full items-end justify-center relative pointer-events-none select-none">
          <div
            className={`absolute bottom-[65%] left-1/2 -translate-x-1/2 w-64 bg-white text-slate-900 p-6 rounded-3xl rounded-bl-none shadow-[0_0_20px_rgba(255,255,255,0.4)] transform transition-all duration-500 ease-in-out z-20 ${
              fadeQuote
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            <p className="font-bold text-lg text-center leading-snug font-comic">
              "{quote}"
            </p>
            <div className="absolute -bottom-4 left-0 w-0 h-0 border-t-[20px] border-t-white border-r-[20px] border-r-transparent" />
          </div>

          <Image
            src="/images/character/lila-normal.png"
            alt="Lila handa nang maglaro"
            width={600}
            height={600}
            className="mx-auto"
            priority
          />
        </div>

        {/* --- RIGHT SIDE: Profile Card --- */}
        <div className="flex-1 w-full flex items-center justify-center md:justify-start md:pl-10 h-full py-20">
          <div className="w-full max-w-lvw animate-in slide-in-from-right-10 duration-700">
            <div className="backdrop-blur-xl bg-slate-900/70 border border-white/20 shadow-[0_0_50px_rgba(139,92,246,0.25)] rounded-3xl text-white p-6 pt-16 relative max-h-[calc(100vh-10rem)] flex flex-col">
              {/* --- Avatar (Floating Top) --- */}
              <div className="absolute -top-12 left-8 w-24 h-24 group cursor-pointer z-50">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-full h-full rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                    <img
                      src={userData.avatarUrl}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-600 text-white font-bold text-xs w-8 h-8 flex items-center justify-center rounded-full border-2 border-slate-900 z-20">
                    {userData.level}
                  </div>
                </div>
              </div>

              {/* Scrollable content wrapper */}
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar scrollbar-hide">
                {/* --- Header & Title --- */}
                <div className="flex justify-between items-start mb-6 pl-24">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                      {userData.username}
                    </h1>
                    <p className="text-cyan-300 font-medium text-xs tracking-wide uppercase flex items-center gap-1">
                      <Star size={12} className="fill-cyan-300" />{" "}
                      {userData.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-white/10">
                    <Flame
                      className="text-orange-500 fill-orange-500 animate-pulse"
                      size={16}
                    />
                    <span className="text-orange-400 font-bold text-sm">
                      {userData.streak}
                    </span>
                  </div>
                </div>

                {/* --- WORD OF THE DAY SECTION --- */}
                <div className="mb-6 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
                  <div className="relative bg-slate-800/80 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
                          Word of the Day
                        </h3>
                        <span className="text-[10px] text-slate-400 italic">
                          Tagalog
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold text-white">
                          {WORD_OF_THE_DAY.word}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {WORD_OF_THE_DAY.pronunciation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 italic">
                        "{WORD_OF_THE_DAY.meaning}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- Stats Cards --- */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3 flex flex-col justify-center items-center hover:bg-slate-800/80 transition-colors">
                    <span className="text-2xl font-bold text-cyan-400 flex items-center gap-1">
                      <Gem size={18} className="fill-cyan-400/20" />{" "}
                      {userData.gems}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Gems
                    </span>
                  </div>
                  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3 flex flex-col justify-center items-center hover:bg-slate-800/80 transition-colors">
                    <span className="text-2xl font-bold text-purple-400 flex items-center gap-1">
                      <Trophy size={18} className="fill-purple-400/20" />{" "}
                      {userData.level}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Current Lvl
                    </span>
                  </div>
                </div>

                {/* --- XP Progress --- */}
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-bold mb-1 text-purple-200 uppercase tracking-wider">
                    <span>XP Progress</span>
                    <span>
                      {userData.xp} / {userData.maxXp}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative transition-all duration-1000 ease-out"
                      style={{ width: `${xpPercentage}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-white/30" />
                    </div>
                  </div>
                </div>

                {/* --- Tabs --- */}
                <div className="flex p-1 bg-slate-950/50 rounded-lg mb-4">
                  {["stats", "badges"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-300 capitalize ${
                        activeTab === tab
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* --- Tab Content --- */}
                <div className="min-h-[140px]">
                  {activeTab === "stats" ? (
                    <div className="bg-gradient-to-br from-violet-900/40 to-slate-900/40 border border-violet-500/20 rounded-xl p-4 relative overflow-hidden group hover:border-violet-500/40 transition-colors">
                      <div className="absolute -right-4 -bottom-4 text-violet-500/10 group-hover:text-violet-500/20 transition-colors">
                        <Sparkles size={100} />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">
                        Next Mission
                      </h3>
                      <p className="text-xs text-purple-200 mb-3">
                        Learn 5 new vocabulary words in the marketplace.
                      </p>

                      <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-bold text-xs text-white transition-all flex items-center justify-center gap-2">
                        Start <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-right-4 duration-300">
                      {achievements.map((ach) => (
                        <div
                          key={ach.id}
                          className={`p-2 rounded-lg border flex flex-col items-center text-center gap-1 ${
                            ach.unlocked
                              ? "bg-slate-800/60 border-purple-500/30"
                              : "bg-slate-900/40 border-slate-700/50 opacity-60 grayscale"
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-full ${
                              ach.unlocked
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-slate-700/30 text-slate-500"
                            }`}
                          >
                            {ach.icon}
                          </div>
                          <h4 className="text-xs font-bold text-slate-200">
                            {ach.title}
                          </h4>
                          {ach.unlocked && ach.status === "unclaimed" && (
                            <span className="text-[10px] text-yellow-400 font-semibold">
                              NEW!
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
