// data/games/parts-of-speech.ts

import { PartsOfSpeechQuestion } from "@/types/games";

export const partsOfSpeechData: PartsOfSpeechQuestion[] = [
  {
    id: 'pos-1',
    sentence: "Ang mabilis na kayumangging soro ay tumalon sa ibabaw ng tamad na aso.",
    word: "mabilis",
    correctAnswer: "Pang-uri",
    hint: "Naglalarawan ito sa soro.",
    explanation: "Ang pang-uri ay naglalarawan ng pangngalan o panghalip. Inilalarawan ng 'mabilis' ang soro."
  },
  {
    id: 'pos-2',
    sentence: "Tumakbo siya tuwing umaga.",
    word: "Tumakbo",
    correctAnswer: "Pandiwa",
    hint: "Ito ay kilos na ginagawa niya.",
    explanation: "Ang pandiwa ay nagsasaad ng kilos o galaw. Ang 'tumakbo' ay kilos na ginagawa ng simuno."
  },
  {
    id: 'pos-3',
    sentence: "Ang aklat ay nasa ibabaw ng mesa.",
    word: "nasa",
    correctAnswer: "Pang-ukol",
    hint: "Nagpapakita ng relasyon ng aklat at mesa.",
    explanation: "Ang pang-ukol ay nag-uugnay ng pangngalan sa iba pang salita sa pangungusap. Ang 'nasa' ay nagpapakita ng lokasyon."
  },
  {
    id: 'pos-4',
    sentence: "Ang kaligayahan ay isang estado ng isipan.",
    word: "kaligayahan",
    correctAnswer: "Pangngalan",
    hint: "Ito ay isang ideya o damdamin.",
    explanation: "Ang pangngalan ay ngalan ng tao, hayop, bagay, pook, o ideya. Ang 'kaligayahan' ay abstraktong pangngalan."
  },
  {
    id: 'pos-5',
    sentence: "Maingat siyang nagsalita sa bata.",
    word: "maingat",
    correctAnswer: "Pang-abay",
    hint: "Ipinapakita kung paano siya nagsalita.",
    explanation: "Ang pang-abay ay nagbibigay turing sa pandiwa, pang-uri, o kapwa pang-abay. Ang 'maingat' ay naglalarawan sa kilos na 'nagsalita'."
  }
];


export const PARTS_OF_SPEECH_DIFFICULTY_SETTINGS: Record<
  1 | 2 | 3, 
  {
    initialTime: number;
    correctBonus: number;
    wrongPenalty: number;
  }
> = {
  1: { 
    initialTime: 120,
    correctBonus: 5,
    wrongPenalty: 3,
  },
  2: { 
    initialTime: 100,
    correctBonus: 8,
    wrongPenalty: 5,
  },
  3: {
    initialTime: 80,
    correctBonus: 10,
    wrongPenalty: 7,
  },
};