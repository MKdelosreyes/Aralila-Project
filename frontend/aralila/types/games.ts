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