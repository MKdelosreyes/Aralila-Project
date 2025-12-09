import { useState, useCallback, useMemo, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { env } from '@/lib/env';

interface UseLobbyProps {
  roomCode: string;
  playerName: string;
  maxPlayers?: number; // Optional - only passed by host
  onGameStart?: (turnOrder: string[]) => void;
}

export function useLobby({ roomCode, playerName, maxPlayers, onGameStart }: UseLobbyProps) {
  const [players, setPlayers] = useState<string[]>([]);
  const [currentMaxPlayers, setCurrentMaxPlayers] = useState<number>(maxPlayers || 3);
  const [isStarting, setIsStarting] = useState(false);
  
  const lastPlayersRef = useRef<string[]>([]);
  const processingMessageRef = useRef(false);

  // NEW: Only include maxPlayers in URL if it's defined (host creating room)
  const wsUrl = useMemo(() => {
    const baseUrl = `${env.wsUrl}/ws/lobby/${roomCode}/?player=${encodeURIComponent(playerName)}`;
    return maxPlayers ? `${baseUrl}&maxPlayers=${maxPlayers}` : baseUrl;
  }, [roomCode, playerName, maxPlayers]);

  const handleMessage = useCallback((data: any) => {
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
          const newPlayers = data.players || [];
          const playersChanged = JSON.stringify(newPlayers) !== JSON.stringify(lastPlayersRef.current);
          
          if (playersChanged) {
            console.log('👥 Players updated:', newPlayers);
            lastPlayersRef.current = newPlayers;
            setPlayers(newPlayers);
          } else {
            console.log('👥 Players unchanged, skipping update');
          }

          // Update maxPlayers from server
          if (data.max_players !== undefined) {
            setCurrentMaxPlayers(data.max_players);
            console.log('🎯 Max players from server:', data.max_players);
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
    maxPlayers: currentMaxPlayers,
    isStarting, 
    isConnected, 
    connectionError,
    sendMessage 
  };
}