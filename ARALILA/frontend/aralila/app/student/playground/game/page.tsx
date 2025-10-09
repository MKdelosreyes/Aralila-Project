"use client";

import dynamic from "next/dynamic";

const StoryChainGame = dynamic(
  () => import("@/components/games/StoryChainGame"),
  {
    ssr: false,
  }
);

export default function GamePage() {
  return <StoryChainGame />;
}
