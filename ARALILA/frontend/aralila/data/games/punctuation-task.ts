// /data/games/punctuation-challenge.ts

import { PunctuationData } from "@/types/games";

export const TIME_LIMIT = 120;
export const BONUS_TIME = 10;
export const BASE_POINTS = 20;

export const PUNCTUATION_MARKS = [".", ",", "?", "!", ";", ":", "'", '"'];

export const punctuationChallengeData: PunctuationData[] = [
  {
    id: 1,
    sentence: "Anong oras na",
    correctPunctuation: [{ position: -1, mark: "?" }],
    hint: "Tanong ito tungkol sa oras",
  },
  {
    id: 2,
    sentence: "Wow ang ganda ng tanawin",
    correctPunctuation: [{ position: 0, mark: "!" }],
    hint: "Nagpapakita ito ng matinding emosyon",
  },
  {
    id: 3,
    sentence: "Pumunta ako sa palengke bumili ng prutas at umuwi kaagad",
    correctPunctuation: [
      { position: 4, mark: "," },
      { position: -1, mark: "." },
    ],
    hint: "Ayusin ang listahan ng kilos",
  },
  {
    id: 3,
    sentence: "Mag-aral ka ng mabuti makakabuti ito sa iyong kinabukasan",
    correctPunctuation: [
      { position: -1, mark: "." },
    ],
    hint: "Dalawang magkaugnay na pangungusap",
  },
];