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