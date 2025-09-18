// THIS IS USE TO LOAD THE GAMES DYNAMICALLY


"use client";

import { useParams } from "next/navigation";

export default function GamePage() {
  const { gameSlug } = useParams();

  return (
    <div className="text-white p-8">
      <h1 className="text-3xl font-bold">Welcome to: {gameSlug}</h1>
      
    </div>
  );
}
