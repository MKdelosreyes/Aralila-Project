"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StoryChainGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const player = searchParams.get("player") || "Player";
  const room = searchParams.get("room") || "default";

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [sentence, setSentence] = useState("");
  const [story, setStory] = useState<string[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [imageIndex, setImageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string | null>(null);
  const [totalImages, setTotalImages] = useState(5);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!room) return;

    // const ws = new WebSocket(`ws://127.0.0.1:8000/ws/story/${room}/`);
    const ws = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_BACKEND_WS_URL}/ws/story/${room}/`
    );
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "player_join", player }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Message:", data);

      switch (data.type) {
        case "players_update":
          setPlayers(data.players);
          break;

        case "story_update":
          setStory((prev) => [...prev, `${data.player}: ${data.text}`]);
          break;

        case "turn_update":
          setCurrentTurn(data.next_player);
          setTimeLeft(data.time_limit || 10);
          break;

        case "timeout_event":
          setStory((prev) => [
            ...prev,
            `⏰ ${data.player} timed out (-${data.penalty})`,
          ]);
          break;

        case "sentence_evaluation":
          setStory((prev) => [...prev, `✅ Sentence: ${data.sentence}`]);
          break;

        case "new_image":
          setImageIndex(data.image_index);
          setTotalImages(data.total_images);
          setImageUrl(data.image_url || null);
          setImageDescription(data.image_description || null);
          break;

        case "game_start":
          console.log("🚀 All players joined, starting game!");
          break;

        case "game_complete":
          setGameOver(true);
          setScores(data.scores);
          break;
      }
    };

    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, [room]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    if (!socket || !sentence.trim()) return;
    socket.send(
      JSON.stringify({ type: "submit_sentence", player, text: sentence })
    );
    setSentence("");
  };

  if (gameOver) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 Game Over!</h2>
        <ul>
          {Object.entries(scores).map(([p, s]) => (
            <li key={p}>
              {p}: {s} points
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Story Chain: {room}</h2>

      <div className="bg-gray-100 p-4 rounded min-h-[150px]">
        <h3 className="font-semibold mb-2">Current Story:</h3>
        {story.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {imageUrl && (
        <div className="mt-4 text-center">
          <img
            src={`http://127.0.0.1:8000${imageUrl}`}
            alt="Story scene"
            className="rounded-lg mx-auto shadow-md max-h-64 object-contain"
          />
          {/* optional — remove if you don't want to show this */}
          <p className="mt-2 text-sm italic text-gray-600">
            {imageDescription}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <p>🧑‍🤝‍🧑 Players: {players.join(", ") || "Waiting..."}</p>
        <p>
          📸 Image {imageIndex + 1}/{totalImages}
        </p>
      </div>

      <div className="flex justify-between mt-3">
        <p>
          🎯 Current Turn: <strong>{currentTurn}</strong>
        </p>
        <p>⏲️ Time Left: {timeLeft}s</p>
      </div>

      <div className="mt-4">
        <input
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Type your part..."
          disabled={currentTurn !== player}
        />
        <button
          onClick={handleSubmit}
          disabled={currentTurn !== player}
          className={`mt-2 px-4 py-2 rounded ${
            currentTurn === player
              ? "bg-blue-500 text-white"
              : "bg-gray-400 text-gray-200"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
