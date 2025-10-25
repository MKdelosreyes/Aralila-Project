import { useState, useCallback, useMemo, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { env } from '@/lib/env';

interface UseLobbyProps {
  roomCode: string;
  playerName: string;
  onGameStart?: (turnOrder: string[]) => void;
}

export function useLobby({ roomCode, playerName, onGameStart }: UseLobbyProps) {
  const [players, setPlayers] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  
  // NEW: Use ref to track last known state and prevent glitches
  const lastPlayersRef = useRef<string[]>([]);
  const processingMessageRef = useRef(false);

  const wsUrl = useMemo(() => 
    `${env.wsUrl}/ws/lobby/${roomCode}/?player=${encodeURIComponent(playerName)}`,
    [roomCode, playerName]
  );

  const handleMessage = useCallback((data: any) => {
    // Prevent processing duplicate messages simultaneously
    if (processingMessageRef.current) {
      console.log('⏸️ Already processing message, queuing...');
      setTimeout(() => handleMessage(data), 50);
      return;
    }

    processingMessageRef.current = true;

    try {
      console.log('📨 Lobby message:', data);

      switch (data.type) {
        case 'player_list':
        case 'player_joined':
        case 'player_left':
          // Only update if players actually changed
          const newPlayers = data.players || [];
          const playersChanged = JSON.stringify(newPlayers) !== JSON.stringify(lastPlayersRef.current);
          
          if (playersChanged) {
            console.log('👥 Players updated:', newPlayers);
            lastPlayersRef.current = newPlayers;
            setPlayers(newPlayers);
          } else {
            console.log('👥 Players unchanged, skipping update');
          }
          break;

        case 'game_start':
          console.log('🚀 Game starting!');
          setIsStarting(true);
          if (data.turn_order) {
            onGameStart?.(data.turn_order);
          }
          break;

        default:
          console.log('⚠️ Unknown message type:', data.type);
      }
    } finally {
      processingMessageRef.current = false;
    }
  }, [onGameStart]);

  const { isConnected, connectionError, sendMessage } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
    onOpen: useCallback(() => {
      console.log('✅ Connected to lobby:', roomCode);
    }, [roomCode]),
    onClose: useCallback(() => {
      console.log('🔌 Disconnected from lobby:', roomCode);
    }, [roomCode]),
    reconnect: true,
    reconnectDelay: 2000,
    maxReconnectAttempts: 3,
  });

  return { 
    players, 
    isStarting, 
    isConnected, 
    connectionError,
    sendMessage 
  };
}