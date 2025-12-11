"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useStoryChain } from "@/hooks/useStoryChain";
import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Image as ImageIcon,
  FileText,
  Zap,
  Trophy,
  Star,
  Edit3,
  Users,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function StoryChainGame() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const player = searchParams.get("player") || "Player";
  const room = searchParams.get("room") || "default";
  const turnOrderParam = searchParams.get("turnOrder") || "";
  const turnOrder = turnOrderParam.split(",").filter(Boolean);

  const [sentence, setSentence] = useState("");
  const previousImageIndexRef = useRef<number>(0);

  const { gameState, isConnected, connectionError, submitSentence, isMyTurn } =
    useStoryChain({
      roomName: room,
      playerName: player,
      turnOrder,
    });

  // Calculate current sentence parts (only for current image)
  const currentSentenceParts = useMemo(() => {
    const playerInputs = gameState.story.filter(
      (s) => s.player !== "SYSTEM" && s.player !== "AI"
    );

    const lastAIIndex = gameState.story.findLastIndex((s) => s.player === "AI");

    const currentInputs =
      lastAIIndex === -1
        ? playerInputs
        : gameState.story
            .slice(lastAIIndex + 1)
            .filter((s) => s.player !== "SYSTEM" && s.player !== "AI");

    return currentInputs;
  }, [gameState.story]);

  // Reset input when image changes
  useEffect(() => {
    if (gameState.imageIndex !== previousImageIndexRef.current) {
      setSentence("");
      previousImageIndexRef.current = gameState.imageIndex;
    }
  }, [gameState.imageIndex]);

  // Calculate completed sentences (only AI evaluations)
  const completedSentences = useMemo(() => {
    return gameState.story.filter(
      (s) => s.player === "AI" || s.player === "SYSTEM"
    );
  }, [gameState.story]);

  const handleSubmit = () => {
    if (!sentence.trim() || !isMyTurn) return;

    let finalText = sentence.trim();
    if (currentSentenceParts.length === 0) {
      finalText = finalText.charAt(0).toUpperCase() + finalText.slice(1);
    }

    submitSentence(finalText);
    setSentence("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Connection Error
  if (connectionError) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border border-purple-200">
          <div className="text-center">
            <WifiOff className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Connection Lost
            </h2>
            <p className="text-gray-600 mb-6">{connectionError}</p>
            <button
              onClick={() => router.push("/student/playground")}
              className="w-full font-semibold py-3 px-6 rounded-xl text-base shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
            >
              Back to Playground
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Over
  if (gameState.gameOver) {
    const sortedScores = Object.entries(gameState.scores).sort(
      ([, a], [, b]) => b - a
    );
    const winner = sortedScores[0];

    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Winner Announcement */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 mb-6 text-white shadow-2xl">
          <div className="text-center">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-purple-200" />
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              Game Over!
            </h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
              <p className="text-2xl md:text-3xl font-bold">
                {winner?.[0] || "N/A"}
              </p>
              <p className="text-lg opacity-90">{winner?.[1] || 0} points</p>
            </div>
          </div>
        </div>

        {/* Final Scores */}
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
            <Star className="text-purple-600 w-7 h-7" />
            Final Scores
          </h3>
          <div className="space-y-3">
            {sortedScores.map(([p, s], i) => (
              <div
                key={p}
                className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                  i === 0
                    ? "bg-gradient-to-r from-purple-100 to-purple-200 border-2 border-purple-400 shadow-md"
                    : "bg-purple-50 border-2 border-purple-200"
                }`}
              >
                <span className="font-bold text-lg text-gray-900 flex items-center gap-3">
                  {i === 0 && <Trophy className="text-purple-600 w-6 h-6" />}
                  {i === 1 && <Star className="text-purple-500 w-5 h-5" />}
                  {i === 2 && <Star className="text-purple-400 w-5 h-5" />}
                  <span>{p}</span>
                </span>
                <span className="font-bold text-2xl text-purple-700">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Story */}
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
            <FileText className="text-purple-600 w-7 h-7" />
            Complete Story
          </h3>
          <div className="bg-purple-50 rounded-xl p-4 max-h-96 overflow-y-auto space-y-3">
            {gameState.story.map((line, i) => (
              <div key={i} className="text-gray-800 leading-relaxed">
                <span className="font-bold text-purple-700">{line.player}:</span>{" "}
                <span>{line.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/student/playground")}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Back to Playground
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="text-purple-600 w-8 h-8" />
              Story Chain
            </h2>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm">
                Room:{" "}
                <span className="font-bold text-purple-700">{room}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-purple-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-xs font-medium text-gray-600">
                {isConnected ? "Connected" : "Reconnecting..."}
              </span>
            </div>
          </div>

          {/* Game Stats */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 border border-purple-300">
              <ImageIcon className="w-4 h-4" />
              Image {gameState.imageIndex + 1}/{gameState.totalImages}
            </span>

            <span
              className={`px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2 border ${
                isMyTurn
                  ? "bg-purple-200 text-purple-900 border-purple-400 animate-pulse"
                  : "bg-purple-50 text-purple-700 border-purple-300"
              }`}
            >
              <Zap className="w-4 h-4" />
              {isMyTurn ? "Your Turn!" : `${gameState.currentTurn}'s Turn`}
            </span>

            <span
              className={`px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2 border ${
                gameState.timeLeft <= 5
                  ? "bg-purple-200 text-purple-900 border-purple-400 animate-pulse"
                  : "bg-purple-100 text-purple-800 border-purple-300"
              }`}
            >
              <Clock className="w-4 h-4" />
              {gameState.timeLeft}s
            </span>
          </div>
        </div>

        {/* Player Order */}
        <div className="flex flex-wrap gap-2 mt-4">
          {gameState.players.map((p, idx) => (
            <div
              key={p}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                p === gameState.currentTurn
                  ? "bg-purple-600 text-white border-purple-700 shadow-md"
                  : p === player
                  ? "bg-purple-500 text-white border-purple-600"
                  : "bg-purple-50 text-purple-900 border-purple-300"
              }`}
            >
              {idx + 1}. {p}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Image */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-6 h-full shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="text-purple-600 w-6 h-6" />
              Current Image
            </h3>
            {gameState.imageUrl ? (
              <div className="relative">
                <Image
                  src={gameState.imageUrl}
                  alt="Story scene"
                  width={150}
                  height={150}
                  className="rounded-xl w-full shadow-2xl object-contain border-4 border-purple-300"
                  style={{ maxHeight: "400px" }}
                />
                <div className="absolute top-3 right-3 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                  Image {gameState.imageIndex + 1}
                </div>
              </div>
            ) : (
              <div className="bg-purple-50 rounded-xl p-12 text-center border-2 border-dashed border-purple-300">
                <ImageIcon className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                <p className="text-purple-600 font-medium">Loading image...</p>
              </div>
            )}
          </div>
        </div>

        {/* Previous Sentences */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-300 rounded-2xl p-6 h-full shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-purple-600 w-6 h-6" />
              Completed
            </h3>
            {completedSentences.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-purple-500 font-medium">
                  No completed sentences yet
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                {completedSentences.map((line, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl shadow-sm border-2 border-purple-200 text-gray-800"
                  >
                    <p className="text-sm leading-relaxed">{line.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Sentence Being Formed */}
      <div className="bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-300 rounded-2xl p-6 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Edit3 className="text-purple-600 w-6 h-6" />
          Building Sentence (Image {gameState.imageIndex + 1})
        </h3>
        <div className="bg-white rounded-xl p-4 min-h-[80px] border-2 border-purple-200">
          <div className="flex flex-wrap items-center gap-3">
            {currentSentenceParts.length === 0 ? (
              <div className="flex items-center gap-2 text-purple-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Waiting for first word...</span>
              </div>
            ) : (
              currentSentenceParts.map((part, idx) => (
                <span
                  key={idx}
                  className={`px-4 py-2 rounded-lg font-semibold text-base shadow-sm border-2 ${
                    part.player === player
                      ? "bg-purple-600 text-white border-purple-700"
                      : "bg-purple-50 text-purple-900 border-purple-300"
                  }`}
                >
                  {part.text}
                </span>
              ))
            )}
            {isMyTurn && currentSentenceParts.length < turnOrder.length && (
              <span className="px-4 py-2 rounded-lg bg-purple-200 border-2 border-purple-400 text-purple-900 font-semibold animate-pulse flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Your word here...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
        {isMyTurn ? (
          <>
            <label className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Edit3 className="text-purple-600 w-5 h-5" />
              Add Your Word/Phrase:
            </label>
            <input
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-2 border-purple-300 bg-purple-50 p-4 rounded-xl w-full focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-lg text-gray-900 font-medium"
              placeholder={
                currentSentenceParts.length === 0
                  ? "Start the sentence (will auto-capitalize)..."
                  : "Continue the sentence..."
              }
              maxLength={50}
              autoFocus
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-purple-700 font-medium">
                {sentence.length}/50 characters
              </span>
              <button
                onClick={handleSubmit}
                disabled={!sentence.trim()}
                className={`px-8 py-3 rounded-xl font-bold text-base transition-all shadow-md ${
                  sentence.trim()
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-lg hover:scale-105"
                    : "bg-purple-200 text-purple-400 cursor-not-allowed"
                }`}
              >
                Submit Word
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-700 text-xl mb-2">
              Waiting for{" "}
              <span className="font-bold text-purple-700">
                {gameState.currentTurn}
              </span>
              's turn...
            </p>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mt-4"></div>
          </div>
        )}
      </div>
    </div>
  );
}