import { PunctuationData } from "@/types/games";

export const TIME_LIMIT = 120; // seconds
export const BONUS_TIME = 10;  // seconds per correct answer in a sentence
export const BASE_POINTS = 20;

export const PUNCTUATION_MARKS = [".", ",", "?", "!", ";", ":", "'", '"'];

export const splitIntoWords = (sentence: string): string[] =>
  sentence.trim().split(/\s+/).filter(Boolean);
/**
 * Position semantics:
 * - position = n (0-based) means: after word at index n (i.e., between words[n] and words[n+1]).
 * - position = -1 means: end of sentence (after the last word).
 * These positions are the “gaps” Lila must fill to cross to the next platform.
 */
export const punctuationChallengeData: PunctuationData[] = [
  {
    id: 1,
    sentence: "Hala May nakalimutan pala ako",
    // Hala  ! May nakalimutan pala ako .
    correctPunctuation: [
      { position: 0, mark: "!" },  // after "Hala"
      { position: -1, mark: "." }, // end of sentence
    ],
    hint: "Maglagay ng bantas pagkatapos ng pagbikas at sa dulo ng pangungusap.",
  },
  {
    id: 2,
    sentence: "Anong oras na",
    // Anong oras na ?
    correctPunctuation: [{ position: -1, mark: "?" }],
    hint: "Tanong ito tungkol sa oras.",
  },
  {
    id: 3,
    sentence: "Pumunta ako sa palengke bumili ng prutas at umuwi kaagad",
 // Pumunta ako sa palengke , bumili ng prutas at umuwi kaagad .
    correctPunctuation: [
      { position: 3, mark: "," },  // after "palengke"
      { position: -1, mark: "." }, // end of sentence
    ],
    hint: "May paghihiwalay sa mga bahagi ng pangungusap.",
  },
  {
    id: 4,
    sentence:
      "Mag aral ka ng mabuti dahil makakabuti ito sa iyong kinabukasan",
    // Mag aral ka ng mabuti ; dahil makakabuti ito sa iyong kinabukasan .
    correctPunctuation: [
      { position: 4, mark: ";" },  // after "mabuti"
      { position: -1, mark: "." }, // end of sentence
    ],
    hint: "Pagdugtungin ang dalawang sugnay gamit ang wastong bantas.",
  },
];