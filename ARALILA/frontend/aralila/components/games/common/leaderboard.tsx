"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { env } from "@/lib/env";

interface LeaderboardEntry {
  user_id: number;
  name: string;
  profile_pic: string | null;
  score: number;
  stars_earned: number;
  difficulty: number;
  time_taken: number;
}

interface LeaderboardProps {
  gameId: number | string | null;
  gameType: string | null;
  areaId: number | string | null;
  difficulty: number;
  limit?: number;
  variant?: "glass" | "light";
}

const Leaderboard = ({
  gameId = null,
  gameType = "",
  areaId = null,
  difficulty = 1,
  limit = 10,
  variant = "glass",
}: LeaderboardProps) => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format time in seconds to MM:SS
  const formatTime = (seconds: number): string => {
    if (!seconds || seconds === 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!gameId && !gameType && !areaId) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;
        const params = new URLSearchParams();
        if (gameId) params.set("game_id", String(gameId));
        if (gameType) params.set("game_type", String(gameType));
        if (areaId) params.set("area_id", String(areaId));
        params.set("difficulty", String(difficulty));
        params.set("limit", String(limit));

        const url = `${
          env.backendUrl
        }/api/progress/leaderboard/?${params.toString()}`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load leaderboard");
        }

        const data = await res.json();
        setEntries(data.results || []);
      } catch (e: unknown) {
        console.error("Leaderboard fetch error", e);
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameId, gameType, areaId, difficulty, limit]);

  const isLight = variant === "light";

  return (
    <div
      className={
        isLight
          ? "w-full max-w-[320px] bg-white rounded-2xl p-3 border border-slate-200 relative"
          : "w-full max-w-[320px] bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/8 relative"
      }
    >
      <h3
        className={
          isLight
            ? "text-slate-800 font-bold text-lg mb-3"
            : "text-white font-bold text-lg mb-3"
        }
      >
        Leaderboard
      </h3>

      {/* Overlay for loading or error */}
      {(loading || error) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-2xl">
          <div className="text-center px-4">
            {loading && <p className="text-sm text-gray-200">Loading...</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {!loading &&
          !error &&
          Array.from({ length: Number(limit || 10) }).map((_, idx) => {
            const e = entries[idx];
            return (
              <li
                key={`leaderboard-slot-${idx}`}
                className={
                  isLight
                    ? "flex items-center justify-between gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100"
                    : "flex items-center justify-between gap-3 bg-white/5 p-2 rounded-lg"
                }
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {e ? (
                      e.profile_pic ? (
                        <Image
                          src={e.profile_pic}
                          alt={e.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                          {e.name?.charAt(0) || "U"}
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        —
                      </div>
                    )}
                  </div>

                  <div className="flex items-center truncate">
                    {e ? (
                      <div
                        className={
                          isLight
                            ? "text-sm text-slate-800 font-semibold truncate"
                            : "text-sm text-white font-semibold truncate"
                        }
                      >
                        {e.name}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No entry</div>
                    )}
                  </div>
                </div>

                <div className="ml-2 flex items-center gap-2 whitespace-nowrap">
                  {e ? (
                    <>
                      <div
                        className={
                          isLight
                            ? "text-xs text-slate-700"
                            : "text-xs text-gray-300"
                        }
                      >
                        {e.score}pts
                      </div>
                      <div
                        className={
                          isLight
                            ? "text-xs text-slate-500"
                            : "text-xs text-gray-400"
                        }
                      >
                        {formatTime(e.time_taken)}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">—</div>
                  )}
                  <div
                    className={
                      isLight
                        ? "text-xs text-yellow-500 font-semibold"
                        : "text-xs text-yellow-300 font-semibold"
                    }
                  >
                    #{idx + 1}
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Leaderboard;