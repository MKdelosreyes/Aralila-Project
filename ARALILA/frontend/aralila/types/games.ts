export interface SpellingResult {
  wordData: {
    word: string;
    hint: string;
  };
  userAnswer: string;
  isCorrect: boolean;
}

export type SpellingWord = {
  word: string;
  definition: string;
  hint: string;
};

export type SpellingChallengeGameProps = {
  words: SpellingWord[];
  onGameComplete: (data: { score: number; results: SpellingResult[] }) => void;
};

// punctuation
// export interface PunctuationData {
//   id: number;
//   sentence: string;
//   correctPunctuation: { position: number; mark: string }[];
//   hint: string;
// }

// export interface PunctuationResult {
//   sentenceData: PunctuationData;
//   userAnswer: { position: number; mark: string }[];
//   isCorrect: boolean;
// }

export interface PunctuationData {
  id: number;
  sentence: string;
  correctPunctuation: { position: number; mark: string }[];
  hint: string;
  // words: string[]; // NEW: Pre-split words for platform display
}

export interface PunctuationResult {
  sentenceData: PunctuationData;
  userAnswer: { position: number; mark: string }[];
  isCorrect: boolean;
  completedGaps: number; // NEW: Track how many gaps were filled correctly
}

export interface PunctuationChallengeGameProps {
  sentences: PunctuationData[];
  onGameComplete: (data: { score: number; results: PunctuationResult[] }) => void;
  onExit: () => void;
}


// parts of speech

export type PartsOfSpeechDifficulty = "easy" | "medium" | "hard";

export interface PartsOfSpeechQuestion {
  id: string;
  sentence: string;
  word: string; // The word to identify the part of speech for
  options: string[]; // e.g., ['Noun', 'Verb', 'Adjective']
  correctAnswer: string;
  hint: string;
  explanation: string; // Optional, for post-game review
}

export interface PartsOfSpeechGameProps {
  questions: PartsOfSpeechQuestion[];
  difficulty: PartsOfSpeechDifficulty;
  onGameComplete: (data: { score: number; results: PartsOfSpeechResult[] }) => void;
  onExit: () => void;
}

export interface PartsOfSpeechResult {
  question: PartsOfSpeechQuestion;
  userAnswer: string;
  isCorrect: boolean;
  skipped: boolean;
  hintUsed: boolean;
}

// word association
export interface WordAssociationQuestion {
  id: string;
  images: string[];
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation?: string;
}


// Lobby Types
export interface LobbyPlayer {
  name: string;
  isHost?: boolean;
}

export interface LobbyMessage {
  type: 'player_list' | 'player_joined' | 'player_left' | 'game_start';
  players?: string[];
  player?: string;
  turn_order?: string[];
}

// Story Chain Types
export interface StoryChainMessage {
  type: string;
  player?: string;
  text?: string;
  players?: string[];
  next_player?: string;
  time_limit?: number;
  penalty?: number;
  sentence?: string;
  score?: number;
  image_index?: number;
  total_images?: number;
  image_url?: string;
  image_description?: string;
  scores?: Record<string, number>;
  message?: string;
}

export interface StoryPart {
  player: string;
  text: string;
}

export interface GameState {
  players: string[];
  story: StoryPart[];
  currentTurn: string;
  scores: Record<string, number>;
  imageIndex: number;
  totalImages: number;
  imageUrl: string | null;
  imageDescription: string | null;
  timeLeft: number;
  gameOver: boolean;
}