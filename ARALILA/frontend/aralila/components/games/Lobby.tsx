"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useLobby } from "@/hooks/useLobby";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function Lobby() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // ✅ FIX: Use player name from URL, not from user profile
  const playerName = searchParams.get("player") || "Guest";
  const roomKey = searchParams.get("room") || "";
  const isHost = searchParams.get("isHost") === "true";

  const [displayPlayers, setDisplayPlayers] = useState<string[]>([]);
  const [displayConnected, setDisplayConnected] = useState(false);

  const { players, isStarting, isConnected, connectionError } = useLobby({
    roomCode: roomKey,
    playerName, // ✅ This is now the custom name from input
    onGameStart: (turnOrder) => {
      console.log("🚀 Game starting with turn order:", turnOrder);
      setTimeout(() => {
        router.push(
          `/student/playground/game?player=${encodeURIComponent(
            playerName
          )}&room=${roomKey}&turnOrder=${turnOrder.join(",")}`
        );
      }, 2000);
    },
  });

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Debounce state updates to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPlayers(players);
    }, 100);

    return () => clearTimeout(timer);
  }, [players]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayConnected(isConnected);
    }, 150);

    return () => clearTimeout(timer);
  }, [isConnected]);

  // Error state
  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold text-red-600">❌ Connection Error</h2>
        <p className="text-gray-600">{connectionError}</p>
        <button
          onClick={() => router.push("/student/playground")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Playground
        </button>
      </div>
    );
  }

  // Missing params
  if (!roomKey || !playerName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold text-yellow-600">⚠️ Invalid Room</h2>
        <p className="text-gray-600">Room key or player name is missing.</p>
        <button
          onClick={() => router.push("/student/playground")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Playground
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h2 className="text-3xl font-bold text-blue-700">🎮 Story Chain Lobby</h2>

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            displayConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span className="text-sm font-medium">
          {displayConnected ? "Connected" : "Connecting..."}
        </span>
      </div>

      {/* Room Key Display */}
      <div className="text-center">
        <p className="text-sm text-gray-600">Room Code:</p>
        <p className="text-2xl font-bold text-blue-600">{roomKey}</p>
        <p className="text-xs text-gray-500 mt-1">
          Share this code with friends
        </p>
      </div>

      {/* Players List */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 w-80 text-center shadow-sm">
        <h3 className="font-semibold text-lg mb-3">
          Players ({displayPlayers.length}/3)
        </h3>

        <ul className="space-y-2">
          {displayPlayers.length === 0 ? (
            <li className="text-gray-400 italic">Waiting for players...</li>
          ) : (
            displayPlayers.map((p, index) => (
              <li
                key={`${p}-${index}`}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
              >
                <span>{p}</span>
                {p === playerName && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    You
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Host Info */}
      {isHost && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md text-center">
          <p className="text-sm text-blue-800">
            ⭐ You are the host. Game starts automatically when 2 players join.
          </p>
        </div>
      )}

      {/* Starting Animation */}
      {isStarting && (
        <div className="text-green-600 font-bold text-xl mt-4 animate-bounce">
          🚀 Starting the game...
        </div>
      )}
    </div>
  );
}
