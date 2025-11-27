export const env = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  wsUrl: process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:8000',
  isDev: process.env.NODE_ENV === 'development',
} as const;

// Validate environment variables (client-side only)
if (typeof window !== 'undefined') {
  console.log('🔧 Environment loaded:', {
    backendUrl: env.backendUrl,
    wsUrl: env.wsUrl,
    isDev: env.isDev,
    raw: {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NEXT_PUBLIC_BACKEND_WS_URL: process.env.NEXT_PUBLIC_BACKEND_WS_URL,
    }
  });

  // Warn if using defaults
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.warn('⚠️ NEXT_PUBLIC_BACKEND_URL not set, using default:', env.backendUrl);
  }
  if (!process.env.NEXT_PUBLIC_BACKEND_WS_URL) {
    console.warn('⚠️ NEXT_PUBLIC_BACKEND_WS_URL not set, using default:', env.wsUrl);
  }
}