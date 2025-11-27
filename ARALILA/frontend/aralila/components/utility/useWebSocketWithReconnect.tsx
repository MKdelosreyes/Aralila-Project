import { useEffect, useRef } from "react";

export function useWebSocketWithReconnect(
  url: string,
  onMessage: (data: any) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    let active = true;

    function connect() {
      if (!active) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      ws.onclose = () => {
        if (!active) return;
        const timeout = Math.min(10000, 1000 * 2 ** reconnectAttempts.current);
        console.warn(`⚠️ Disconnected. Reconnecting in ${timeout / 1000}s...`);
        reconnectAttempts.current += 1;
        reconnectTimeout.current = window.setTimeout(connect, timeout);
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        ws.close();
      };
    }

    connect();

    return () => {
      active = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [url, onMessage]);

  return wsRef;
}
