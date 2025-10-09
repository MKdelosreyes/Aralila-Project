"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlaygroundHome() {
  const [playerName, setPlayerName] = useState("");
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (!playerName || !roomName) {
      alert("Please enter both your name and a room name!");
      return;
    }

    router.push(
      `/student/playground/game?player=${playerName}&room=${roomName}`
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold">🎨 Story Chain Playground</h2>
      <input
        className="border p-2 rounded w-64"
        placeholder="Your name..."
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <input
        className="border p-2 rounded w-64"
        placeholder="Room name..."
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button
        onClick={handleJoin}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Join Room
      </button>
    </div>
  );
}
