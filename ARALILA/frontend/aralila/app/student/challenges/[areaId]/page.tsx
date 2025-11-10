"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { env } from "@/lib/env";
import CardCarousel from "@/components/student/challenges/cardcarousel";
import Header from "@/components/student/header";
import FullMenuScreen from "@/components/student/fullscreen-menu";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import ChallengesBackground from "@/components/bg/challenges-bg";
import Image from "next/image";

interface Area {
  id: number;
  name: string;
  description: string;
  completed_games: number;
  total_games: number;
  average_score: number;
}

export default function AreaChallengesPage() {
  const params = useParams();
  const areaId = params.areaId as string;

  const [menuOpen, setMenuOpen] = useState(false);
  const [areaData, setAreaData] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);

  const areaSymbols = [
    "/images/art/Playground-Area-Symbol.png",
    "/images/art/Classroom-Area-Symbol.png",
    "/images/art/Home-Area-Symbol.png",
    "/images/art/Classroom-Area-Symbol.png",
    "/images/art/Home-Area-Symbol.png",
  ];

  useEffect(() => {
    fetchAreaData();
  }, [areaId]);

  const fetchAreaData = async () => {
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
      console.log("Area data fetched:", data); // Debug log
      setAreaData(data.area);
      // ❌ Removed: setGames(data.games); - CardCarousel fetches this itself
    } catch (error) {
      console.error("Failed to fetch area data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundComponent = () => {
    switch (parseInt(areaId)) {
      case 1:
        return <ChallengesBackground img_path="/images/bg/Playground.png" />;
      case 2:
        return <ChallengesBackground img_path="/images/bg/Classroom.png" />;
      case 3:
        return <ChallengesBackground img_path="/images/bg/Home.png" />;
      case 4:
        return <ChallengesBackground img_path="/images/bg/Town.png" />;
      case 5:
        return <ChallengesBackground img_path="/images/bg/Mountainside.png" />;
      default:
        return <AnimatedBackground />;
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading area...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullMenuScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Dynamic Background */}
      {getBackgroundComponent()}

      {/* Area Info Header (Optional - currently commented out) */}
      {areaData && (
        <div className="relative z-10 pt-24 px-8 text-center text-white">
          <h1 className="text-4xl font-bold mb-2">{areaData.name}</h1>
          <p className="text-gray-300 mb-1">{areaData.description}</p>
          <p className="text-sm text-gray-400">
            {areaData.completed_games}/{areaData.total_games} games completed •{" "}
            {areaData.average_score}% average
          </p>
        </div>
      )}

      {/* Game Cards Carousel - Only needs areaId */}
      <CardCarousel areaId={parseInt(areaId)} />

      {/* Area Symbols Footer */}
      <div className="flex flex-row gap-5 absolute bottom-0 left-0 right-0 z-[100] p-4 md:p-6 w-full items-center justify-center">
        {areaSymbols.map((symbol, index) => {
          return (
            <div key={index}>
              <Image
                src={symbol}
                alt={`Area ${index + 1} Symbol`}
                width={180}
                height={180}
                className="mt-[-100px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
