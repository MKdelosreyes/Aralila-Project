"use client";

import dynamic from "next/dynamic";

const Lobby = dynamic(() => import("@/components/games/Lobby"), {
  ssr: false,
});

export default function GamePage() {
  return <Lobby />;
}
