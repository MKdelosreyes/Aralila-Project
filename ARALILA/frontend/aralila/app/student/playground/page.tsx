"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedBackground from "@/components/bg/animatedforest-bg";

export default function PlaygroundHome() {
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const [useRealName, setUseRealName] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(3);
  const router = useRouter();
  const { user } = useAuth();

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
    // Pass maxPlayers when creating
    router.push(
      `/student/playground/lobby?player=${encodeURIComponent(
        playerName
      )}&room=${newKey}&isHost=true&maxPlayers=${maxPlayers}`
    );
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomKey) {
      alert("Please enter your name and room key!");
      return;
    }

    // NEW: Don't pass maxPlayers when joining - backend will use stored value
    router.push(
      `/student/playground/lobby?player=${encodeURIComponent(
        playerName
      )}&room=${roomKey}&isHost=false`
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-2xl bg-white/95 text-black rounded-xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-purple-700 mb-3">
            Story Chain Playground
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Create or join a room to play Story Chain with friends.
          </p>
          {!mode && (
            <div className="flex flex-col gap-4 items-center">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("create")}
                  className="w-full font-bold py-3 px-6 rounded-xl text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                >
                  Create Game Room
                </button>
                <button
                  onClick={() => setMode("join")}
                  className="w-full font-bold py-3 px-6 rounded-xl text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                >
                  Join Existing Room
                </button>
              </div>
            </div>
          )}

          {mode === "create" && (
            <div className="mt-4 flex flex-col items-center gap-3 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-purple-700">
                Create a Game Room
              </h3>

              {/* Player count selector */}
              <div className="w-full max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Players:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMaxPlayers(2)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                      maxPlayers === 2
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    2 Players
                  </button>
                  <button
                    onClick={() => setMaxPlayers(3)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                      maxPlayers === 3
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    3 Players
                  </button>
                </div>
              </div>

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
              <div className="flex gap-3">
                <button
                  onClick={handleCreateRoom}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                >
                  Generate Room
                </button>
                <button
                  onClick={() => {
                    setMode(null);
                    setPlayerName("");
                    setUseRealName(false);
                    setMaxPlayers(3);
                  }}
                  className="text-gray-500 underline text-sm"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {mode === "join" && (
            <div className="mt-4 flex flex-col items-center gap-3 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-purple-700">
                Join a Game Room
              </h3>

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
              <div className="flex gap-3">
                <button
                  onClick={handleJoinRoom}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
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
                  className="text-gray-500 underline text-sm"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
