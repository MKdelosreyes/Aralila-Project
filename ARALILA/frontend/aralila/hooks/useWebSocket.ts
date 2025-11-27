import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(false);
  const connectingRef = useRef(false); // NEW: Prevent duplicate connections
  
  // Store callbacks in refs to avoid recreating connect function
  const callbacksRef = useRef({ onMessage, onOpen, onClose, onError });
  
  useEffect(() => {
    callbacksRef.current = { onMessage, onOpen, onClose, onError };
  }, [onMessage, onOpen, onClose, onError]);

  useEffect(() => {
    // Prevent double connection from React Strict Mode
    if (mountedRef.current) {
      console.log('⏸️ Component already mounted, skipping reconnection');
      return;
    }
    
    mountedRef.current = true;

    const connect = () => {
      // Prevent duplicate connections
      if (connectingRef.current) {
        console.log('⏸️ Already connecting, skipping...');
        return;
      }

      // Close existing connection first
      if (socketRef.current) {
        const currentState = socketRef.current.readyState;
        if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
          console.log('⚠️ Closing existing connection');
          socketRef.current.close();
          socketRef.current = null;
        }
      }

      try {
        console.log('🔌 Connecting to:', url);
        connectingRef.current = true;
        
        if (!url || (!url.startsWith('ws://') && !url.startsWith('wss://'))) {
          throw new Error(`Invalid WebSocket URL: ${url}`);
        }

        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!mountedRef.current) {
            ws.close();
            return;
          }
          
          console.log('✅ WebSocket connected');
          connectingRef.current = false;
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttemptsRef.current = 0;
          callbacksRef.current.onOpen?.();
        };

        ws.onmessage = (event) => {
          if (!mountedRef.current) return;
          
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Received:', data);
            callbacksRef.current.onMessage?.(data);
          } catch (error) {
            console.error('❌ Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          if (!mountedRef.current) return;
          
          console.error('❌ WebSocket error');
          connectingRef.current = false;
          setConnectionError('Connection error');
          callbacksRef.current.onError?.(error);
        };

        ws.onclose = (event) => {
          connectingRef.current = false;
          
          if (!mountedRef.current) {
            console.log('🔌 WebSocket closed (component unmounted)');
            return;
          }

          console.log('🔌 WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          socketRef.current = null;
          callbacksRef.current.onClose?.();

          // Reconnect logic
          if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                connect();
              }
            }, reconnectDelay);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            setConnectionError(`Failed after ${maxReconnectAttempts} attempts`);
          }
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        connectingRef.current = false;
        setConnectionError(String(error));
      }
    };

    // Initial connection with small delay to avoid Strict Mode issues
    const initialTimeout = setTimeout(connect, 100);

    return () => {
      console.log('🧹 Cleaning up WebSocket...');
      mountedRef.current = false;
      connectingRef.current = false;
      
      clearTimeout(initialTimeout);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        const ws = socketRef.current;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
        socketRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [url, reconnect, reconnectDelay, maxReconnectAttempts]); // Only URL and config in deps

  const sendMessage = (data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    console.warn('⚠️ Cannot send - WebSocket not connected');
    return false;
  };

  return {
    isConnected,
    connectionError,
    sendMessage,
    disconnect: () => {
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
    },
  };
}