//spelling

import { SpellingResult } from "@/components/games/spelling-challenge/summary";

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
export interface PunctuationData {
  id: number;
  sentence: string;
  correctPunctuation: { position: number; mark: string }[];
  hint: string;
}

export interface PunctuationResult {
  sentenceData: PunctuationData;
  userAnswer: { position: number; mark: string }[];
  isCorrect: boolean;
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