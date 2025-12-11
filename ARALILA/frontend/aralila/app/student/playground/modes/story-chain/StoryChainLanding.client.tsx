"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedBackground from "@/components/bg/animated-bg";
import Image from "next/image";
import { Users, Play, ArrowLeft, Hash, User, Gamepad2 } from "lucide-react";

export default function StoryChainLanding() {
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
    return Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const handleCreateRoom = () => {
    if (!playerName) {
      // You might want to replace this alert with a toast later
      alert("Please enter your name!");
      return;
    }

    const newKey = generateRoomKey();
    router.push(
      `/student/playground/modes/story-chain/lobby?player=${encodeURIComponent(
        playerName
      )}&room=${newKey}&isHost=true&maxPlayers=${maxPlayers}`
    );
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomKey) {
      alert("Please enter your name and room key!");
      return;
    }

    router.push(
      `/student/playground/modes/story-chain/lobby?player=${encodeURIComponent(
        playerName
      )}&room=${roomKey}&isHost=false`
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-gray-900 font-sans selection:bg-purple-500/30">
      {/* Background Layer */}
      <AnimatedBackground />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {/* Title Image - Positioned to "pop out" above container */}
        <div className="relative z-20 mb-[-60px] md:mb-[-80px]">
          <div className="relative">
            <Image
              src="/images/overlays/story-chain_title.png"
              alt="Story Chain Title"
              width={500}
              height={200}
              className="w-auto h-auto max-w-[280px] md:max-w-[400px] object-contain drop-shadow-2xl"
              priority
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-transparent to-transparent blur-xl -z-10"></div>
          </div>
        </div>

        {/* White Card Container */}
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 md:p-10 pt-20 md:pt-24 transform transition-all">
          
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm md:text-base">
              Collaborative storytelling with your friends
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                🎯 Multiplayer
              </span>
              <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
                ✨ Creative
              </span>
            </div>
          </div>

          {/* MODE SELECTION */}
          {!mode && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setMode("create")}
                className="group relative flex items-center p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 w-full text-left shadow-sm hover:shadow-lg"
              >
                <div className="p-3 rounded-full bg-purple-500 text-white group-hover:bg-purple-600 transition-colors shadow-md">
                  <Gamepad2 size={24} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-lg text-purple-900 group-hover:text-purple-700 transition-colors">
                    Create Room
                  </h3>
                  <p className="text-xs text-purple-600">Host a new game session</p>
                </div>
                <ArrowLeft className="rotate-180 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-purple-600" size={20} />
              </button>

              <button
                onClick={() => setMode("join")}
                className="group relative flex items-center p-5 rounded-2xl bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 w-full text-left shadow-sm hover:shadow-lg"
              >
                <div className="p-3 rounded-full bg-pink-500 text-white group-hover:bg-pink-600 transition-colors shadow-md">
                  <Users size={24} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-lg text-pink-900 group-hover:text-pink-700 transition-colors">
                    Join Room
                  </h3>
                  <p className="text-xs text-pink-600">Enter code to join friends</p>
                </div>
                <ArrowLeft className="rotate-180 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-pink-600" size={20} />
              </button>
            </div>
          )}

          {/* CREATE MODE */}
          {mode === "create" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 mb-2">
                 <h3 className="text-2xl font-bold text-purple-900">Setup Game</h3>
              </div>

              {/* Name Input Group */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                  Your Identity
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Enter nickname..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    disabled={useRealName}
                  />
                </div>
                
                {user && (
                  <label className="flex items-center gap-3 p-3 cursor-pointer group bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${useRealName ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-500'}`}>
                        {useRealName && <ArrowLeft className="rotate-[-90deg] text-white w-3 h-3" strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={useRealName}
                      onChange={(e) => setUseRealName(e.target.checked)}
                      className="hidden"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-purple-900 transition-colors">
                      Use real name <span className="text-purple-600 font-semibold">({user.full_name})</span>
                    </span>
                  </label>
                )}
              </div>

              {/* Player Count */}
              <div className="space-y-3">
                 <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                  Lobby Size
                </label>
                <div className="bg-gray-100 p-1.5 rounded-xl border-2 border-gray-200 flex gap-2">
                  {[2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMaxPlayers(num)}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                        maxPlayers === num
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-purple-600 hover:bg-white"
                      }`}
                    >
                      {num} Players
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={handleCreateRoom}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transform transition hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Play size={20} fill="currentColor" />
                  Generate Room
                </button>
                <button
                  onClick={() => setMode(null)}
                  className="w-full py-3 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                >
                  ← Cancel
                </button>
              </div>
            </div>
          )}

          {/* JOIN MODE */}
          {mode === "join" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-pink-900">Join Game</h3>
             </div>

              {/* Name Input Group */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                  Your Identity
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="Enter nickname..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    disabled={useRealName}
                  />
                </div>
                 {user && (
                   <label className="flex items-center gap-3 p-3 cursor-pointer group bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
                   <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${useRealName ? 'bg-pink-600 border-pink-600' : 'border-gray-300 group-hover:border-pink-500'}`}>
                       {useRealName && <ArrowLeft className="rotate-[-90deg] text-white w-3 h-3" strokeWidth={3} />}
                   </div>
                   <input
                     type="checkbox"
                     checked={useRealName}
                     onChange={(e) => setUseRealName(e.target.checked)}
                     className="hidden"
                   />
                   <span className="text-sm text-gray-700 group-hover:text-pink-900 transition-colors">
                     Use real name <span className="text-pink-600 font-semibold">({user.full_name})</span>
                   </span>
                 </label>
                )}
              </div>

              {/* Room Key Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">
                  Access Code
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono tracking-widest uppercase text-lg font-bold"
                    placeholder="X5B7QK"
                    maxLength={6}
                    value={roomKey}
                    onChange={(e) => setRoomKey(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={handleJoinRoom}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 transform transition hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Play size={20} fill="currentColor" />
                  Enter Room
                </button>
                <button
                  onClick={() => setMode(null)}
                  className="w-full py-3 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                >
                  ← Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}