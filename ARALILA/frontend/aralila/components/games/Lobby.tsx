"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useLobby } from "@/hooks/useLobby";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Users, Rocket, Star } from "lucide-react";

interface LobbyProps {
  showHeader?: boolean;
}

export default function Lobby({ showHeader = true }: LobbyProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const playerName = searchParams.get("player") || "Guest";
  const roomKey = searchParams.get("room") || "";
  const isHost = searchParams.get("isHost") === "true";
  const maxPlayersParam = searchParams.get("maxPlayers");

  const [displayPlayers, setDisplayPlayers] = useState<string[]>([]);
  const [displayConnected, setDisplayConnected] = useState(false);
  const [displayMaxPlayers, setDisplayMaxPlayers] = useState(3); // Default to 3

  // NEW: Only pass maxPlayers if it exists (host creating room)
  const { players, maxPlayers, isStarting, isConnected, connectionError } =
    useLobby({
      roomCode: roomKey,
      playerName,
      maxPlayers: maxPlayersParam ? parseInt(maxPlayersParam) : undefined,
      onGameStart: (turnOrder) => {
        console.log("🚀 Game starting with turn order:", turnOrder);
        setTimeout(() => {
          router.push(
<<<<<<< HEAD
            `/student/playground/game?player=${encodeURIComponent(
=======
            `/student/playground/modes/story-chain/game?player=${encodeURIComponent(
>>>>>>> development
              playerName
            )}&room=${roomKey}&turnOrder=${turnOrder.join(",")}`
          );
        }, 2000);
      },
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  // Update displayed max players from server
  useEffect(() => {
    if (maxPlayers) {
      setDisplayMaxPlayers(maxPlayers);
      console.log("🎯 Display max players updated to:", maxPlayers);
    }
  }, [maxPlayers]);

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
    <div className="flex flex-col items-center gap-6 px-4">
      {showHeader && (
        <h2 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
          <Users />
          Story Chain Lobby
        </h2>
      )}

      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            displayConnected ? "bg-purple-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span className="text-sm font-medium">
          {displayConnected ? "Connected" : "Connecting..."}
        </span>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">Room Code:</p>
        <p className="text-2xl font-bold text-purple-600">{roomKey}</p>
        <p className="text-xs text-gray-500 mt-1">
          Share this code with friends
        </p>
        <p className="text-sm text-purple-600 font-semibold mt-2">
          {displayMaxPlayers} Player Game
        </p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 w-80 text-center shadow-sm">
        <h3 className="font-semibold text-lg mb-3 flex items-center justify-center gap-2">
          <Users className="text-purple-500" /> Players ({displayPlayers.length}
          /{displayMaxPlayers})
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
                <span className="text-sm font-medium">{p}</span>
                {p === playerName && (
                  <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                    You
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {isHost && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 max-w-md text-center">
          <p className="text-sm text-purple-800 flex items-center gap-2 justify-center">
            <Star className="text-yellow-400" /> You are the host. Game starts
            automatically when {displayMaxPlayers} players join.
          </p>
        </div>
      )}

      {isStarting && (
        <div className="text-purple-600 font-bold text-xl mt-4 animate-bounce flex items-center gap-2">
          <Rocket className="text-purple-600" /> Starting the game...
        </div>
      )}
    </div>
  );
}
