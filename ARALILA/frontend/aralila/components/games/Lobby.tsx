"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useLobby } from "@/hooks/useLobby";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Users, Rocket, Star, AlertTriangle } from "lucide-react";

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
            `/student/playground/modes/story-chain/game?player=${encodeURIComponent(
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
      <div className="flex items-center justify-center min-h-[320px] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-red-100 shadow-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="text-red-500" />
            <h2 className="text-xl font-bold text-red-600">Connection issue</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">{connectionError}</p>
          <button
            onClick={() => router.push("/student/playground")}
            className="w-full font-semibold py-3 rounded-xl text-base flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_4px_15px_rgba(168,85,247,0.35)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.45)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
          >
            Back to Playground
          </button>
        </div>
      </div>
    );
  }

  if (!roomKey || !playerName) {
    return (
      <div className="flex items-center justify-center min-h-[320px] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-yellow-100 shadow-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="text-yellow-500" />
            <h2 className="text-xl font-bold text-yellow-700">Invalid room</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            The room code or player name is missing.
          </p>
          <button
            onClick={() => router.push("/student/playground")}
            className="w-full font-semibold py-3 rounded-xl text-base flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_4px_15px_rgba(168,85,247,0.35)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.45)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
          >
            Back to Playground
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-2 sm:px-4 py-2 w-full">
      {showHeader && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-purple-600" />
          Story Chain Lobby
        </h2>
      )}

      <div className="flex items-center gap-2 text-gray-700">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            displayConnected ? "bg-purple-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span className="text-sm font-medium">
          {displayConnected ? "Connected" : "Connecting..."}
        </span>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-white px-5 py-4 shadow-sm text-center">
          <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
            Room code
          </p>
          <p className="mt-1 text-2xl font-extrabold text-purple-700 tracking-[0.15em]">
            {roomKey}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Share this code with your friends to invite them
          </p>
          <p className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-white/80 border border-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            <Users size={14} /> {displayMaxPlayers} player game
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 w-full max-w-md shadow-sm">
        <h3 className="font-semibold text-base mb-3 flex items-center justify-between gap-2 text-gray-900">
          <span className="inline-flex items-center gap-2">
            <Users className="text-purple-500" /> Players
          </span>
          <span className="text-xs font-medium text-gray-500">
            {displayPlayers.length}/{displayMaxPlayers}
          </span>
        </h3>

        <ul className="space-y-2">
          {displayPlayers.length === 0 ? (
            <li className="text-gray-500 italic text-sm">
              Waiting for other players to join...
            </li>
          ) : (
            displayPlayers.map((p, index) => (
              <li
                key={`${p}-${index}`}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-800">{p}</span>
                {p === playerName && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-semibold">
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
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-purple-800 bg-purple-50 border border-purple-200 rounded-full px-4 py-2">
          <Rocket className="text-purple-600" /> Starting the game...
        </div>
      )}
    </div>
  );
}
