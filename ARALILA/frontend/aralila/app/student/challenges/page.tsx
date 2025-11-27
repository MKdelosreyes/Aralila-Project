"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  order_index: number;
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
    order_index: 0,
    name: "Playground",
    image: "/images/art/Playground-Area-Symbol.png",
    bgPath: "/images/bg/Playground.png",
  },
  {
    order_index: 1,
    name: "Classroom",
    image: "/images/art/Classroom-Area-Symbol.png",
    bgPath: "/images/bg/Classroom.png",
  },
  {
    order_index: 2,
    name: "Home",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Home.png",
  },
  {
    order_index: 3,
    name: "Town",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Town.png",
  },
  {
    order_index: 4,
    name: "Mountainside",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Mountainside.png",
  },
];

export default function ChallengesPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading challenges...</p>
          </div>
        </div>
      }
    >
      <ChallengesPageInner />
    </Suspense>
  );
}

function ChallengesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaParam = searchParams.get("area");

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAreaOrder, setSelectedAreaOrder] = useState<number>(
    areaParam ? parseInt(areaParam) : 0
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

    if (isAreaLocked(selectedAreaOrder)) {
      const firstUnlocked = areaSymbols.find(
        (a) => !isAreaLocked(a.order_index)
      );
      if (firstUnlocked) {
        setSelectedAreaOrder(firstUnlocked.order_index);
      }
    } else {
      fetchAreaData(selectedAreaOrder);
    }
  }, [selectedAreaOrder]);

  const fetchAreaData = async (orderIndex: number) => {
    if (isAreaLocked(orderIndex)) {
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
        `${env.backendUrl}/api/games/area/order/${orderIndex}/`,
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

  const handleAreaClick = (orderIndex: number) => {
    if (isAreaLocked(orderIndex)) {
      return;
    }
    setSelectedAreaOrder(orderIndex);
  };

  const getBackgroundComponent = () => {
    const selectedArea = areaSymbols.find(
      (a) => a.order_index === selectedAreaOrder
    );
    if (selectedArea?.bgPath) {
      return <ChallengesBackground img_path={selectedArea.bgPath} />;
    }
    return <AnimatedBackground />;
  };

  const progress = getAreaProgress(selectedAreaOrder);

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

  console.log("Games length for area ", selectedAreaOrder, ":", games.length);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullMenuScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedAreaOrder}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {getBackgroundComponent()}
        </motion.div>
      </AnimatePresence>

      {/* Game Cards Carousel */}
      {loading ? (
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <p className="text-white text-xl">Loading games...</p>
        </div>
      ) : (
        <CardCarousel areaId={selectedAreaOrder} games={games} />
      )}

      {/* Area Selection Symbols at Bottom */}
      <div className="flex flex-row gap-3 md:gap-5 absolute bottom-0 left-0 right-0 z-[100] p-4 md:p-6 w-full items-center justify-center">
        {areaSymbols.map((area) => {
          const locked = isAreaLocked(area.order_index);
          const isSelected = selectedAreaOrder === area.order_index;

          return (
            <motion.div key={area.order_index} className="relative">
              <motion.button
                onClick={() => handleAreaClick(area.order_index)}
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
