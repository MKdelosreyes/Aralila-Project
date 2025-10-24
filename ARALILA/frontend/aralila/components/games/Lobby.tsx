"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Lobby() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const player = searchParams.get("player");
  const roomKey = searchParams.get("room");
  const isHost = searchParams.get("isHost") === "true";

  const [_socket, setSocket] = useState<WebSocket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!roomKey || !player) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/lobby/${roomKey}/?player=${encodeURIComponent(
        player
      )}`
    );
    setSocket(ws);

    ws.onopen = () => {
      console.log("✅ Connected to lobby:", roomKey);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Lobby event:", data);

      //   if (data.type === "player_joined" || data.type === "player_left") {
      //     setPlayers(data.players);
      //   }
      if (data.type === "player_list") {
        setPlayers(data.players);
      } else if (data.type === "player_joined") {
        setPlayers((prev) => [...new Set([...prev, data.player])]);
      } else if (data.type === "player_left") {
        setPlayers((prev) => prev.filter((p) => p !== data.player));
      }

      if (data.type === "game_start") {
        setIsStarting(true);
        setTimeout(() => {
          router.push(
            `/student/playground/game?player=${player}&room=${roomKey}&turnOrder=${data.turn_order.join(
              ","
            )}`
          );
        }, 2000);
      }
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from lobby");
    };

    return () => ws.close();
  }, []);

  // --- UI ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h2 className="text-3xl font-bold text-blue-700">🎮 Story Chain Lobby</h2>

      {/* Room Key Display */}
      <div className="text-center">
        <p className="text-gray-600 mb-1">Room Key:</p>
        <p className="text-3xl font-mono font-bold tracking-widest bg-gray-100 p-3 rounded-lg border border-gray-300">
          {roomKey}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Share this key with your classmates to join.
        </p>
      </div>

      {/* Players List */}
      <div className="bg-gray-100 rounded-lg p-4 w-72 text-center">
        <h3 className="text-lg font-semibold mb-2">👥 Players Joined</h3>
        {players.length === 0 ? (
          <p>No players yet...</p>
        ) : (
          <ul className="text-left mb-2">
            {players.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        )}
        {/* <ul className="space-y-1">
          {players.map((p, i) => (
            <li
              key={i}
              className={`py-1 px-2 rounded ${
                p === player ? "bg-green-200 font-semibold" : "bg-white"
              }`}
            >
              {p} {p === player && "(You)"}
            </li>
          ))}
        </ul> */}
        <p className="text-sm text-gray-500 mt-2">
          Waiting for {3 - players.length} more player(s)...
        </p>
      </div>

      {isHost && (
        <p className="text-sm text-gray-600 italic">
          You are the host. The game will start automatically once 3 players
          join.
        </p>
      )}

      {isStarting && (
        <div className="text-green-600 font-semibold mt-4 animate-pulse">
          Starting the game... 🚀
        </div>
      )}
    </div>
  );
}
