"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { env } from "@/lib/env";
import CardCarousel from "@/components/student/challenges/cardcarousel";
import Header from "@/components/student/header";
import FullMenuScreen from "@/components/student/fullscreen-menu";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import ChallengesBackground from "@/components/bg/challenges-bg";

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

export default function AreaChallengesPage() {
  const params = useParams();
  const areaId = params.areaId as string;

  const [menuOpen, setMenuOpen] = useState(false);
  const [areaData, setAreaData] = useState<Area | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

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
      setGames(data.games);
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

      {/* Area Info Header */}
      {/* <div className="relative z-10 pt-24 px-8 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">{areaData?.name}</h1>
        <p className="text-gray-300 mb-1">{areaData?.description}</p>
        <p className="text-sm text-gray-400">
          {areaData?.completed_games}/{areaData?.total_games} games completed •{" "}
          {areaData?.average_score}% average
        </p>
      </div> */}

      {/* Game Cards Carousel */}
      <CardCarousel areaId={parseInt(areaId)} games={games} />
    </div>
  );
}
