// data/games/parts-of-speech.ts

import { PartsOfSpeechQuestion } from "@/types/games";

export const partsOfSpeechData: PartsOfSpeechQuestion[] = [
  {
    id: 'pos-1',
    sentence: "Ang mabilis na kayumangging soro ay tumalon sa ibabaw ng tamad na aso.",
    word: "mabilis",
    options: ["Pangngalan", "Pandiwa", "Pang-uri", "Pang-abay"],
    correctAnswer: "Pang-uri",
    hint: "Naglalarawan ito sa soro.",
    explanation: "Ang pang-uri ay naglalarawan ng pangngalan o panghalip. Inilalarawan ng 'mabilis' ang soro."
  },
  {
    id: 'pos-2',
    sentence: "Tumakbo siya tuwing umaga.",
    word: "Tumakbo",
    options: ["Pangngalan", "Pandiwa", "Pang-uri", "Pang-ukol"],
    correctAnswer: "Pandiwa",
    hint: "Ito ay kilos na ginagawa niya.",
    explanation: "Ang pandiwa ay nagsasaad ng kilos o galaw. Ang 'tumakbo' ay kilos na ginagawa ng simuno."
  },
  {
    id: 'pos-3',
    sentence: "Ang aklat ay nasa ibabaw ng mesa.",
    word: "nasa",
    options: ["Pangngalan", "Pandiwa", "Pang-abay", "Pang-ukol"],
    correctAnswer: "Pang-ukol",
    hint: "Nagpapakita ng relasyon ng aklat at mesa.",
    explanation: "Ang pang-ukol ay nag-uugnay ng pangngalan sa iba pang salita sa pangungusap. Ang 'nasa' ay nagpapakita ng lokasyon."
  },
  {
    id: 'pos-4',
    sentence: "Ang kaligayahan ay isang estado ng isipan.",
    word: "kaligayahan",
    options: ["Pangngalan", "Pang-uri", "Pang-abay", "Padamdam"],
    correctAnswer: "Pangngalan",
    hint: "Ito ay isang ideya o damdamin.",
    explanation: "Ang pangngalan ay ngalan ng tao, hayop, bagay, pook, o ideya. Ang 'kaligayahan' ay abstraktong pangngalan."
  },
  {
    id: 'pos-5',
    sentence: "Maingat siyang nagsalita sa bata.",
    word: "maingat",
    options: ["Pang-uri", "Pang-abay", "Pandiwa", "Pangatnig"],
    correctAnswer: "Pang-abay",
    hint: "Ipinapakita kung paano siya nagsalita.",
    explanation: "Ang pang-abay ay nagbibigay turing sa pandiwa, pang-uri, o kapwa pang-abay. Ang 'maingat' ay naglalarawan sa kilos na 'nagsalita'."
  }
];


export const PARTS_OF_SPEECH_DIFFICULTY_SETTINGS = {
  easy: {
    initialTime: 90, // seconds
    correctBonus: 15, // seconds added for correct answer
    wrongPenalty: 5, // seconds removed for wrong answer
    hintCost: 5, // stars
  },
  medium: {
    initialTime: 60,
    correctBonus: 10,
    wrongPenalty: 10,
    hintCost: 10,
  },
  hard: {
    initialTime: 45,
    correctBonus: 5,
    wrongPenalty: 15,
    hintCost: 15,
  },
};