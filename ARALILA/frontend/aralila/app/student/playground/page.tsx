"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function PlaygroundHome() {
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const [useRealName, setUseRealName] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // ✅ Auto-fill with real name if checkbox is checked
  useEffect(() => {
    if (useRealName && user) {
      setPlayerName(user.full_name);
    }
  }, [useRealName, user]);

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
      `/student/playground/lobby?player=${encodeURIComponent(
        playerName
      )}&room=${newKey}&isHost=true`
    );
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomKey) {
      alert("Please enter your name and room key!");
      return;
    }

    router.push(
      `/student/playground/lobby?player=${encodeURIComponent(
        playerName
      )}&room=${roomKey}&isHost=false`
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h2 className="text-3xl font-bold">🎨 Story Chain Playground</h2>

      {!mode && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setMode("create")}
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition"
          >
            Create Game Room
          </button>
          <button
            onClick={() => setMode("join")}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
          >
            Join Existing Room
          </button>
        </div>
      )}

      {/* CREATE ROOM MODE */}
      {mode === "create" && (
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Create a Game Room</h3>

          {/* ✅ NEW: Checkbox to use real name */}
          {user && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useRealName}
                onChange={(e) => setUseRealName(e.target.checked)}
                className="w-4 h-4"
              />
              Use my real name ({user.full_name})
            </label>
          )}

          <input
            className="border p-2 rounded w-64"
            placeholder="Your game name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={useRealName}
          />
          <button
            onClick={handleCreateRoom}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Generate Room
          </button>
          <button
            onClick={() => {
              setMode(null);
              setPlayerName("");
              setUseRealName(false);
            }}
            className="text-gray-500 underline text-sm mt-2"
          >
            ← Back
          </button>
        </div>
      )}

      {/* JOIN ROOM MODE */}
      {mode === "join" && (
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Join a Game Room</h3>

          {/* ✅ NEW: Checkbox to use real name */}
          {user && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useRealName}
                onChange={(e) => setUseRealName(e.target.checked)}
                className="w-4 h-4"
              />
              Use my real name ({user.full_name})
            </label>
          )}

          <input
            className="border p-2 rounded w-64"
            placeholder="Your game name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={useRealName}
          />
          <input
            className="border p-2 rounded w-64 uppercase"
            placeholder="Enter Room Key (e.g., X5B7QK)"
            value={roomKey}
            onChange={(e) => setRoomKey(e.target.value.toUpperCase())}
          />
          <button
            onClick={handleJoinRoom}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Join Room
          </button>
          <button
            onClick={() => {
              setMode(null);
              setPlayerName("");
              setRoomKey("");
              setUseRealName(false);
            }}
            className="text-gray-500 underline text-sm mt-2"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
