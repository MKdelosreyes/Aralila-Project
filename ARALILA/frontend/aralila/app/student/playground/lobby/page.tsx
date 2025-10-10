"use client";

import Lobby from "@/components/games/Lobby";
import dynamic from "next/dynamic";

const StoryChainGame = dynamic(() => import("@/components/games/Lobby"), {
  ssr: false,
});

export default function GamePage() {
  return <Lobby />;
}
