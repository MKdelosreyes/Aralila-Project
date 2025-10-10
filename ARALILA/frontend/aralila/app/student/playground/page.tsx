"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlaygroundHome() {
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const router = useRouter();

  // Utility to generate a random 6-character room key
  const generateRoomKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const handleCreateRoom = () => {
    if (!playerName) {
      alert("Please enter your name!");
      return;
    }

    const newKey = generateRoomKey();
    router.push(
      `/student/playground/lobby?player=${playerName}&room=${newKey}&isHost=true`
    );
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomKey) {
      alert("Please enter your name and room key!");
      return;
    }

    router.push(
      `/student/playground/lobby?player=${playerName}&room=${roomKey}&isHost=false`
    );
  };

  // ---------- UI ----------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h2 className="text-3xl font-bold">🎨 Story Chain Playground</h2>

      {!mode && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setMode("create")}
            className="bg-green-500 text-white px-6 py-3 rounded"
          >
            Create Game Room
          </button>
          <button
            onClick={() => setMode("join")}
            className="bg-blue-500 text-white px-6 py-3 rounded"
          >
            Join Existing Room
          </button>
        </div>
      )}

      {/* --- CREATE ROOM MODE --- */}
      {mode === "create" && (
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-xl font-semibold">Create a Game Room</h3>
          <input
            className="border p-2 rounded w-64"
            placeholder="Your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            onClick={handleCreateRoom}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Generate Room
          </button>
          <button
            onClick={() => setMode(null)}
            className="text-gray-500 underline text-sm mt-2"
          >
            ← Back
          </button>
        </div>
      )}

      {/* --- JOIN ROOM MODE --- */}
      {mode === "join" && (
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-xl font-semibold">Join a Game Room</h3>
          <input
            className="border p-2 rounded w-64"
            placeholder="Your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            className="border p-2 rounded w-64 uppercase"
            placeholder="Enter Room Key (e.g., X5B7QK)"
            value={roomKey}
            onChange={(e) => setRoomKey(e.target.value.toUpperCase())}
          />
          <button
            onClick={handleJoinRoom}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Join Room
          </button>
          <button
            onClick={() => setMode(null)}
            className="text-gray-500 underline text-sm mt-2"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
