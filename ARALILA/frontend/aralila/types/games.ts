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
word: string; // word to identifyS
correctAnswer: string;
hint: string;
explanation: string;
}


export interface PartsOfSpeechGameProps {
questions: PartsOfSpeechQuestion[];
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

// export type PartsOfSpeechDifficulty = "easy" | "medium" | "hard";

// type Word = {
//   id: string;
//   text: string;
//   partOfSpeech: string; // "pangngalan" | "pandiwa" | "pang-abay"
// };

// type Question = {
//   sentence: string;
//   words: Word[];
// };

// export interface PartsOfSpeechQuestion {
//   id: string;
//   question: Question[]; 
//   correctAnswer: string;
//   hint: string;
// }

// export interface PartsOfSpeechGameProps {
//   questions: PartsOfSpeechQuestion[];
//   onGameComplete: (data: { score: number; results: PartsOfSpeechResult[] }) => void;
//   onExit: () => void;
// }

// export interface PartsOfSpeechResult {
//   question: PartsOfSpeechQuestion;
//   userAnswer: string;
//   isCorrect: boolean;
//   skipped: boolean;
//   hintUsed: boolean;
// }