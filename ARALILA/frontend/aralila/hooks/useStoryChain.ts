import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { env } from '@/lib/env';
import type { StoryChainMessage, GameState } from '@/types/games';

interface UseStoryChainOptions {
  roomName: string;
  playerName: string;
  turnOrder: string[]; 
}

export function useStoryChain({ roomName, playerName, turnOrder }: UseStoryChainOptions) {
  const [gameState, setGameState] = useState<GameState>({
    players: turnOrder,
    story: [],
    currentTurn: turnOrder[0] || '', 
    scores: {},
    imageIndex: 0,
    totalImages: 5,
    imageUrl: null,
    imageDescription: null,
    timeLeft: 20,
    gameOver: false,
  });

  const hasJoinedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // NEW: Track timer

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
          // NEW: Force immediate UI update
          setGameState((prev) => {
            const newStory = [...prev.story, { player: data.player!, text: data.text! }];
            console.log('📝 Story updated:', newStory);
            return {
              ...prev,
              story: newStory,
            };
          });
        }
        break;

      case 'turn_update':
        console.log('🔄 Turn update:', data.next_player);
        
        // NEW: Clear existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
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
        
        // NEW: Clear timer when image changes
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        setGameState((prev) => ({
          ...prev,
          imageIndex: data.image_index ?? prev.imageIndex,
          totalImages: data.total_images ?? prev.totalImages,
          imageUrl: data.image_url || null,
          imageDescription: data.image_description ?? null,
          timeLeft: 20, 
        }));
        break;

      case 'game_complete':
        console.log('🏁 Game complete:', data.scores);
        
        // NEW: Clear timer on game end
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
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

  // Auto-join game when connected
  useEffect(() => {
    if (isConnected && !hasJoinedRef.current) {
      console.log('🎮 Joining game as:', playerName);
      sendMessage({ type: 'player_join', player: playerName });
      hasJoinedRef.current = true;
    }
  }, [isConnected, playerName, sendMessage]);

  const submitSentence = useCallback((text: string) => {
    if (text.trim() && gameState.currentTurn === playerName) {
      console.log('📤 Submitting:', text);
      sendMessage({ type: 'submit_sentence', player: playerName, text: text.trim() });
    }
  }, [sendMessage, playerName, gameState.currentTurn]);

  // NEW: Timer countdown - only runs when it's someone's turn
  useEffect(() => {
    if (gameState.gameOver) return;
    
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Only start timer if game has started (currentTurn is set)
    if (gameState.currentTurn && gameState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = Math.max(0, prev.timeLeft - 1);
          if (newTime === 0) {
            console.log('⏰ Time expired for:', prev.currentTurn);
          }
          return { ...prev, timeLeft: newTime };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.currentTurn, gameState.gameOver]); 

  return {
    gameState,
    isConnected,
    connectionError,
    submitSentence,
    isMyTurn: gameState.currentTurn === playerName,
  };
}