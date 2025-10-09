"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebSocketWithReconnect } from "../utility/useWebSocketWithReconnect";

export default function StoryChainGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const player = searchParams.get("player");
  const room = searchParams.get("room");

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [sentence, setSentence] = useState("");
  const [story, setStory] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string>("Player 1");

  useEffect(() => {
    if (typeof window === "undefined" || !room) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/story/${room}/`);
    setSocket(ws);

    ws.onmessage = (event) => {
      console.log("📩 Message received:", event.data);
      const data = JSON.parse(event.data);
      if (data.type === "story_update") {
        setStory((prev) => [...prev, `${data.player}: ${data.text}`]);
      } else if (data.type === "turn_update") {
        setCurrentTurn(data.next_player);
      }
    };

    return () => ws.close();
  }, [room]);

  const handleSubmit = () => {
    if (!socket || !sentence) return;
    socket.send(
      JSON.stringify({
        type: "submit_sentence",
        player: player,
        text: sentence,
      })
    );

    setSentence("");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Story Chain: {room}</h2>

      <div className="bg-gray-100 p-4 rounded min-h-[150px]">
        <h3 className="font-semibold">Current Story:</h3>
        {story.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="mt-4">
        <input
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Type your part..."
        />
        <button
          onClick={handleSubmit}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
