"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useStoryChain } from "@/hooks/useStoryChain";
import { useState, useMemo, useEffect, useRef } from "react";

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

  // ✅ Calculate current sentence parts (only for current image)
  const currentSentenceParts = useMemo(() => {
    // Filter only player inputs (not SYSTEM or AI messages)
    const playerInputs = gameState.story.filter(
      (s) => s.player !== "SYSTEM" && s.player !== "AI"
    );

    // Get only inputs after the last AI evaluation
    const lastAIIndex = gameState.story.findLastIndex((s) => s.player === "AI");

    const currentInputs =
      lastAIIndex === -1
        ? playerInputs // No AI evaluation yet, take all inputs
        : gameState.story
            .slice(lastAIIndex + 1)
            .filter((s) => s.player !== "SYSTEM" && s.player !== "AI");

    return currentInputs;
  }, [gameState.story]);

  // ✅ Reset input when image changes
  useEffect(() => {
    if (gameState.imageIndex !== previousImageIndexRef.current) {
      setSentence(""); // Clear input for new image
      previousImageIndexRef.current = gameState.imageIndex;
    }
  }, [gameState.imageIndex]);

  // ✅ Calculate completed sentences (only AI evaluations)
  const completedSentences = useMemo(() => {
    return gameState.story.filter(
      (s) => s.player === "AI" || s.player === "SYSTEM"
    );
  }, [gameState.story]);

  const handleSubmit = () => {
    if (!sentence.trim() || !isMyTurn) return;

    // Auto-capitalize first letter if this is the first word
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
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

  // Game Over
  if (gameState.gameOver) {
    const sortedScores = Object.entries(gameState.scores).sort(
      ([, a], [, b]) => b - a
    );
    const winner = sortedScores[0];

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2">🎉 Game Over!</h2>
          <p className="text-xl text-green-600 font-semibold">
            🏆 Winner: {winner?.[0] || "N/A"} ({winner?.[1] || 0} points)
          </p>
        </div>

        {/* Scores */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">
            📊 Final Scores
          </h3>
          <ul className="space-y-2">
            {sortedScores.map(([p, s], i) => (
              <li
                key={p}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  i === 0
                    ? "bg-yellow-100 border-2 border-yellow-400"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <span className="font-semibold">
                  {i === 0 && "🥇 "}
                  {i === 1 && "🥈 "}
                  {i === 2 && "🥉 "}
                  {p}
                </span>
                <span className="font-bold text-lg">{s} pts</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Full Story */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">📖 Complete Story</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {gameState.story.map((line, i) => (
              <p key={i} className="text-gray-700">
                <strong>{line.player}:</strong> {line.text}
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/student/playground")}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          📚 Story Chain: {room}
        </h2>

        {/* Connection Status */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>

        {/* Game Stats */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="bg-blue-100 px-3 py-1 rounded-full">
            📸 Image {gameState.imageIndex + 1}/{gameState.totalImages}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-bold ${
              isMyTurn
                ? "bg-green-200 text-green-800 animate-pulse"
                : "bg-gray-200"
            }`}
          >
            🎯 {isMyTurn ? "YOUR TURN!" : `Turn: ${gameState.currentTurn}`}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-bold ${
              gameState.timeLeft <= 5
                ? "bg-red-200 text-red-700 animate-pulse"
                : "bg-orange-100"
            }`}
          >
            ⏲️ {gameState.timeLeft}s
          </span>
        </div>

        {/* Player Order */}
        <div className="flex justify-center gap-2 mt-3">
          {gameState.players.map((p, idx) => (
            <div
              key={p}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                p === gameState.currentTurn
                  ? "bg-green-500 text-white"
                  : p === player
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {idx + 1}. {p}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ MAIN LAYOUT: Image + Previous Sentences Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Image (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          {gameState.imageUrl ? (
            <div>
              <div className="relative">
                <img
                  src={gameState.imageUrl}
                  alt="Story scene"
                  className="rounded-lg w-full shadow-xl object-cover border-4 border-blue-200"
                  style={{ maxHeight: "500px" }}
                />
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Image {gameState.imageIndex + 1}
                </div>
              </div>
              {gameState.imageDescription && (
                <p className="mt-3 text-sm text-gray-600 text-center italic bg-gray-50 p-3 rounded-lg">
                  💭 {gameState.imageDescription}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">📷 Loading image...</p>
            </div>
          )}
        </div>

        {/* ✅ Previous Sentences (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 h-full">
            <h3 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2">
              <span>📜</span>
              <span>Previous Sentences</span>
            </h3>
            {completedSentences.length === 0 ? (
              <p className="text-gray-400 italic text-sm text-center py-8">
                No completed sentences yet...
              </p>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                {completedSentences.map((line, i) => (
                  <div
                    key={i}
                    className={`text-sm p-3 rounded-lg ${
                      line.player === "AI"
                        ? "bg-green-50 border-l-4 border-green-400"
                        : "bg-gray-50 border-l-4 border-gray-300"
                    }`}
                  >
                    {line.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Current Sentence Being Formed - RESETS PER IMAGE */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-sm text-gray-600 mb-2">
          📝 Current Sentence (Image {gameState.imageIndex + 1}):
        </h3>
        <div className="flex flex-wrap items-center gap-2 min-h-[40px]">
          {currentSentenceParts.length === 0 ? (
            <span className="text-gray-400 italic">
              Waiting for first word...
            </span>
          ) : (
            currentSentenceParts.map((part, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-lg font-medium ${
                  part.player === player
                    ? "bg-blue-500 text-white"
                    : "bg-white border-2 border-gray-200"
                }`}
              >
                {part.text}
              </span>
            ))
          )}
          {isMyTurn && currentSentenceParts.length < turnOrder.length && (
            <span className="px-3 py-1 rounded-lg bg-green-200 border-2 border-green-400 animate-pulse">
              ✍️ Your word here...
            </span>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
        {isMyTurn ? (
          <>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✍️ Add your word/phrase to the sentence:
            </label>
            <input
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-2 border-gray-300 p-3 rounded-lg w-full focus:border-blue-500 focus:outline-none text-lg"
              placeholder={
                currentSentenceParts.length === 0
                  ? "Start the sentence (will auto-capitalize)..."
                  : "Continue the sentence..."
              }
              maxLength={50}
              autoFocus
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {sentence.length}/50 characters
              </span>
              <button
                onClick={handleSubmit}
                disabled={!sentence.trim()}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  sentence.trim()
                    ? "bg-green-500 text-white hover:bg-green-600 hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Word
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-2">
              ⏳ Waiting for{" "}
              <strong className="text-blue-600">{gameState.currentTurn}</strong>
              's turn...
            </p>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
