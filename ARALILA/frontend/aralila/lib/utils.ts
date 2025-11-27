import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PARTS_OF_SPEECH_OPTIONS = [
  "Pangngalan",
  "Pandiwa",
  "Pang-uri",
  "Pang-abay",
  "Pang-ukol",
  "Pangatnig",
  "Pang-angkop",
  "Pang-angkop",
  "Padamdam"
];

/**
 * Generates 3 random options including the correct answer
 * @param correctAnswer - The correct part of speech
 * @returns Array of 3 shuffled options
 */
export const generatePartsOfSpeechOptions = (correctAnswer: string): string[] => {
  // Get all options except the correct answer
  const availableOptions = PARTS_OF_SPEECH_OPTIONS.filter(
    (option) => option !== correctAnswer
  );

  // Shuffle and pick 2 random wrong answers
  const shuffled = availableOptions.sort(() => Math.random() - 0.5);
  const wrongAnswers = shuffled.slice(0, 2);

  // Combine with correct answer and shuffle again
  const finalOptions = [...wrongAnswers, correctAnswer].sort(
    () => Math.random() - 0.5
  );

  return finalOptions;
};


export interface GrammarSentenceQuestion {
  id: number;
  sentence: string; // correct sentence
}

export interface RuntimeGrammarQuestion {
  id: number;
  correctTokens: string[];
  jumbledTokens: string[]; // generated
}

const TOKEN_REGEX = /[\w’']+|[.,!?;:()\-]/gu;

export function tokenizeSentence(sentence: string): string[] {
  return (sentence.match(TOKEN_REGEX) || []).map(t => t);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildRuntimeQuestions(base: GrammarSentenceQuestion[]): RuntimeGrammarQuestion[] {
  return base.map(q => {
    const tokens = tokenizeSentence(q.sentence);
    let jumbled = shuffleArray(tokens);
    // Ensure jumbled differs from correct (if possible)
    const same = jumbled.every((t, i) => t === tokens[i]);
    if (same && tokens.length > 1) {
      // simple swap first two
      [jumbled[0], jumbled[1]] = [jumbled[1], jumbled[0]];
    }
    return {
      id: q.id,
      correctTokens: tokens,
      jumbledTokens: jumbled,
    };
  });
}