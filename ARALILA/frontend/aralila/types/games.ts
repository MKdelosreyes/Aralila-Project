export interface SpellingResult {
  wordData: {
    word: string;
    sentence: string;
  };
  userAnswer: string;
  isCorrect: boolean;
}

export type SpellingWord = {
  word: string;
  sentence: string;
};

export type SpellingChallengeGameProps = {
  words: SpellingWord[];
  onGameComplete: (data: { score: number; results: SpellingResult[] }) => void;
};

export interface PunctuationData {
  id: number;
  sentence: string;
  correctPunctuation: { position: number; mark: string }[];
  hint: string;
  // words: string[]; // NEW: Pre-split words for platform display
}

export interface PunctuationResult {
  sentenceData: {
    sentence: string;
    correctPunctuation: { position: number; mark: string }[];
    hint?: string;
    explanation?: string;
  };
  userAnswer: { position: number; mark: string }[];
  isCorrect: boolean;
  completedGaps: number;
}

export interface PunctuationChallengeGameProps {
  sentences: {
    sentence: string;
    correctPunctuation: { position: number; mark: string }[];
    hint?: string;
    explanation?: string;
  }[];
  difficulty?: number;
  onGameComplete: (args: {
    percentScore: number;  
    rawPoints: number;     
    results: PunctuationResult[];
    timeTaken: number;
  }) => void;
  onExit: () => void;
}


// parts of speech

export type PartsOfSpeechDifficulty = 1 | 2 | 3;

export interface PartsOfSpeechQuestion {
  id: string;
  sentence: string;
  word: string; 
  options?: string[];
  correctAnswer: string;
  hint: string;
  explanation: string; 
}

export interface PartsOfSpeechGameProps {
  questions: PartsOfSpeechQuestion[];
  difficulty: PartsOfSpeechDifficulty;
  onGameComplete: (args: {
    percentScore: number;  
    rawPoints: number;
    results: PartsOfSpeechResult[];
    timeTaken: number;
  }) => void;
  onExit: () => void;
}

export interface PartsOfSpeechResult {
  question: PartsOfSpeechQuestion;
  userAnswer: string;
  isCorrect: boolean;
  skipped: boolean;
  hintUsed: boolean;
}

export interface GrammarSentenceQuestion {
  id: number;
  sentence: string; // correct sentence
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

// Assessment props

export type ChallengeOption = {
  id: number;
  text: string;
  correct: boolean;
  imageSrc: string | null;
  audioSrc: string | null;
};

export type ChallengeType = {
  id: number;
  type: string;
  question: string;
  order: number;
  completed: boolean;
  challengeOptions: ChallengeOption[];
  correctAnswer?: string;
  imagePrompt?: string;
  words?: Array<{
    id: number;
    text: string;
    word?: string;
    index?: number;
    correctTag?: string;
    correctPosition?: number;
  }>;
  punctuationMarks?: Array<{ id: number; mark: string; positions: number[] }>;
  posOptions?: Array<{ id: number; text: string; isCorrect: boolean }>;
};

export type QuizProps = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialAreaId: number;
  initialLessonChallenges: ChallengeType[];
  userSubscription: {
    isActive: boolean;
  } | null;
};