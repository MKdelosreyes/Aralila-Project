"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import Header from "@/components/student/header";
import FullMenuScreen from "@/components/student/fullscreen-menu";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import ChallengesBackground from "@/components/bg/challenges-bg";
import CardCarousel from "@/components/student/challenges/cardcarousel";
import Image from "next/image";
import { Lock, TrendingUp } from "lucide-react";
import { useAreaUnlocks } from "@/hooks/useAreaUnlocks";

interface Area {
  id: number;
  name: string;
  description: string;
  completed_games: number;
  total_games: number;
  average_score: number;
}

interface Game {
  id: number;
  name: string;
  description: string;
  game_type: string;
  icon: string;
  best_score: number;
  completed: boolean;
}

const areaSymbols = [
  {
    id: 1,
    name: "Playground",
    image: "/images/art/Playground-Area-Symbol.png",
    bgPath: "/images/bg/Playground.png",
  },
  {
    id: 2,
    name: "Classroom",
    image: "/images/art/Classroom-Area-Symbol.png",
    bgPath: "/images/bg/Classroom.png",
  },
  {
    id: 3,
    name: "Home",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Home.png",
  },
  {
    id: 4,
    name: "Town",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Town.png",
  },
  {
    id: 5,
    name: "Mountainside",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Mountainside.png",
  },
];

export default function ChallengesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaParam = searchParams.get("area");

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number>(
    areaParam ? parseInt(areaParam) : 1
  );
  const [areaData, setAreaData] = useState<Area | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    isAreaLocked,
    getAreaProgress,
    loading: progressLoading,
  } = useAreaUnlocks();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Find first unlocked area if selected area is locked
    if (isAreaLocked(selectedAreaId)) {
      const firstUnlocked = areaSymbols.find((a) => !isAreaLocked(a.id));
      if (firstUnlocked) {
        setSelectedAreaId(firstUnlocked.id);
      }
    } else {
      fetchAreaData(selectedAreaId);
    }
  }, [selectedAreaId]);

  const fetchAreaData = async (areaId: number) => {
    if (isAreaLocked(areaId)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `${env.backendUrl}/api/games/area/${areaId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch area data: ${response.status}`);
      }

      const data = await response.json();
      console.log("Area data fetched:", data);
      setAreaData(data.area);
      setGames(data.games);
    } catch (error) {
      console.error("Failed to fetch area data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = (areaId: number) => {
    if (isAreaLocked(areaId)) {
      return; // Don't allow selection of locked areas
    }
    setSelectedAreaId(areaId);
  };

  const getBackgroundComponent = () => {
    const selectedArea = areaSymbols.find((a) => a.id === selectedAreaId);
    if (selectedArea?.bgPath) {
      return <ChallengesBackground img_path={selectedArea.bgPath} />;
    }
    return <AnimatedBackground />;
  };

  const progress = getAreaProgress(selectedAreaId);

  if (progressLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullMenuScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedAreaId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {getBackgroundComponent()}
        </motion.div>
      </AnimatePresence>

      {/* Area Info Header */}
      {/* <div className="relative z-10 pt-24 px-8 text-center text-white">
        <motion.h1
          key={`title-${selectedAreaId}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2"
        >
          {areaData?.name || "Loading..."}
        </motion.h1>
        {areaData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-300 mb-2">{areaData.description}</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <p className="text-gray-400">
                {areaData.completed_games}/{areaData.total_games} games
                completed
              </p>
              <p className="text-gray-400">
                {areaData.average_score}% average score
              </p>
            </div>

            {progress && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 inline-block"
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-purple-400" size={20} />
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Practice Progress</p>
                      <p className="text-sm font-bold">
                        {progress.challengesPracticed}/6 games •{" "}
                        <span
                          className={
                            progress.averagePracticeScore >= 70
                              ? "text-green-400"
                              : "text-yellow-400"
                          }
                        >
                          {Math.round(progress.averagePracticeScore)}% avg
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div> */}

      {/* Game Cards Carousel */}
      {loading ? (
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <p className="text-white text-xl">Loading games...</p>
        </div>
      ) : (
        <CardCarousel areaId={selectedAreaId} games={games} />
      )}

      {/* Area Selection Symbols at Bottom */}
      <div className="flex flex-row gap-3 md:gap-5 absolute bottom-0 left-0 right-0 z-[100] p-4 md:p-6 w-full items-center justify-center">
        {areaSymbols.map((area) => {
          const locked = isAreaLocked(area.id);
          const isSelected = selectedAreaId === area.id;

          return (
            <motion.div key={area.id} className="relative">
              <motion.button
                onClick={() => handleAreaClick(area.id)}
                disabled={locked}
                whileHover={!locked ? { scale: 1.1 } : {}}
                whileTap={!locked ? { scale: 0.95 } : {}}
                className={`relative transition-all duration-300 ${
                  locked
                    ? "opacity-30 cursor-not-allowed grayscale"
                    : isSelected
                    ? "opacity-100 scale-110"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <Image
                  src={area.image}
                  alt={`${area.name} Symbol`}
                  width={180}
                  height={180}
                  className="mt-[-100px] drop-shadow-2xl"
                />

                {/* Lock Overlay */}
                {locked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 border-2 border-white/20">
                      <Lock className="text-white drop-shadow-lg" size={32} />
                    </div>
                  </motion.div>
                )}

                {/* Active Indicator */}
                {isSelected && !locked && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Lock Label */}
              {locked && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
                >
                  Complete previous area
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
