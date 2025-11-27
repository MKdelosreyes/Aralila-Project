import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { env } from '@/lib/env';
import type { StoryChainMessage, GameState } from '@/types/games';

interface UseStoryChainOptions {
  roomName: string;
  playerName: string;
  turnOrder: string[]; // NEW: Pass turn order from lobby
}

export function useStoryChain({ roomName, playerName, turnOrder }: UseStoryChainOptions) {
  const [gameState, setGameState] = useState<GameState>({
    players: turnOrder, // NEW: Initialize with turn order
    story: [],
    currentTurn: turnOrder[0] || '', // NEW: First player starts
    scores: {},
    imageIndex: 0,
    totalImages: 5,
    imageUrl: null,
    imageDescription: null,
    timeLeft: 20,
    gameOver: false,
  });

  const hasJoinedRef = useRef(false);

  const handleMessage = useCallback((data: StoryChainMessage) => {
    console.log('🎮 Game message:', data);

    switch (data.type) {
      case 'players_update':
        if (data.players) {
          setGameState((prev) => ({ ...prev, players: data.players! }));
        }
        break;

      case 'story_update':
        if (data.player && data.text) {
          setGameState((prev) => ({
            ...prev,
            story: [...prev.story, { player: data.player!, text: data.text! }],
          }));
        }
        break;

      case 'turn_update':
        console.log('🔄 Turn update:', data.next_player);
        setGameState((prev) => ({
          ...prev,
          currentTurn: data.next_player || '',
          timeLeft: data.time_limit || 20,
        }));
        break;

      case 'timeout_event':
        if (data.player && data.penalty) {
          setGameState((prev) => ({
            ...prev,
            story: [...prev.story, { 
              player: 'SYSTEM', 
              text: `⏰ ${data.player} timed out (-${data.penalty} pts)` 
            }],
          }));
        }
        break;

      case 'sentence_evaluation':
        if (data.sentence && data.score !== undefined) {
          setGameState((prev) => ({
            ...prev,
            story: [...prev.story, { 
              player: 'AI', 
              text: `✅ Complete sentence: "${data.sentence}" | Score: ${data.score}/20` 
            }],
          }));
        }
        break;

      case 'new_image':
        console.log('🖼️ New image:', data);
        setGameState((prev) => ({
          ...prev,
          imageIndex: data.image_index ?? prev.imageIndex,
          totalImages: data.total_images ?? prev.totalImages,
          imageUrl: data.image_url ? `${env.backendUrl}${data.image_url}` : null,
          imageDescription: data.image_description ?? null,
          timeLeft: 20, // Reset timer for new image
        }));
        break;

      case 'game_complete':
        console.log('🏁 Game complete:', data.scores);
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          scores: data.scores || prev.scores,
        }));
        break;

      case 'error':
        console.error('❌ Game error:', data.message);
        break;
    }
  }, []);

  const wsUrl = `${env.wsUrl}/ws/story/${roomName}/?player=${encodeURIComponent(playerName)}`;

  const { isConnected, connectionError, sendMessage } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
    onOpen: useCallback(() => {
      console.log('✅ Connected to Story Chain game');
    }, []),
  });

  // NEW: Auto-join game when connected
  useEffect(() => {
    if (isConnected && !hasJoinedRef.current) {
      console.log('🎮 Joining game as:', playerName);
      sendMessage({ type: 'player_join', player: playerName });
      hasJoinedRef.current = true;
    }
  }, [isConnected, playerName, sendMessage]);

  const submitSentence = useCallback((text: string) => {
    if (text.trim() && gameState.currentTurn === playerName) {
      sendMessage({ type: 'submit_sentence', player: playerName, text: text.trim() });
    }
  }, [sendMessage, playerName, gameState.currentTurn]);

  // Timer countdown
  useEffect(() => {
    if (gameState.timeLeft <= 0 || gameState.gameOver) return;
    
    const timer = setInterval(() => {
      setGameState((prev) => {
        const newTime = Math.max(0, prev.timeLeft - 1);
        if (newTime === 0) {
          console.log('⏰ Time expired for:', prev.currentTurn);
        }
        return { ...prev, timeLeft: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.timeLeft, gameState.gameOver]);

  return {
    gameState,
    isConnected,
    connectionError,
    submitSentence,
    isMyTurn: gameState.currentTurn === playerName,
  };
}