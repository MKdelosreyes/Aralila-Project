import { PunctuationData } from "@/types/games";

export const TIME_LIMIT = 120; // seconds
export const BONUS_TIME = 10; // seconds
export const BASE_POINTS = 20;

export const PUNCTUATION_MARKS = [".", ",", "?", "!", ";", ":", "'", '"'];

// The 'position' now refers to the zero-based index of the space
// between words where the punctuation mark should be placed.
export const punctuationChallengeData: PunctuationData[] = [
  {
    id: 1,
    sentence: "Anong oras na", // "Anong oras na ?"
    correctPunctuation: [{ position: 2, mark: "?" }], // After "na" (2nd space)
    hint: "Tanong ito tungkol sa oras.",
  },
  {
    id: 2,
    sentence: "Wow ang ganda ng tanawin", // "Wow ! ang ganda ng tanawin"
    correctPunctuation: [{ position: 0, mark: "!" }], // After "Wow" (0th space)
    hint: "Nagpapakita ito ng matinding emosyon.",
  },
  {
    id: 3,
    sentence: "Pumunta ako sa palengke bumili ng prutas at umuwi kaagad", // "Pumunta ako sa palengke, bumili ng prutas at umuwi kaagad."
    correctPunctuation: [
      { position: 3, mark: "," }, // After "palengke" (3rd space)
      { position: 9, mark: "." }, // At the very end (9th space)
    ],
    hint: "Ayusin ang listahan ng kilos.",
  },
  {
    id: 4, // Corrected duplicate ID
    sentence: "Mag-aral ka ng mabuti dahil makakabuti ito sa iyong kinabukasan", // "Mag-aral ka ng mabuti; makakabuti ito sa iyong kinabukasan."
    correctPunctuation: [
        { position: 3, mark: ";" }, // Using a semicolon to connect two related independent clauses.
        { position: 9, mark: "." }  // At the very end (9th space)
    ],
    hint: "Gamitin ang tamang bantas para pagdugtungin ang dalawang sugnay.",
  },
];