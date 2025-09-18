// data/games/parts-of-speech.ts

import { PartsOfSpeechQuestion } from "@/types/games";

<<<<<<< HEAD
export const partOfSpeechData: PartsOfSpeechQuestion[] = [
  {
    id: "q1",
    sentence: "The cat is eating the bread enthusiastically.",
    word: "cat",
    correctAnswer: "Pangngalan",
    hint: "It names an animal.",
    explanation: "‘Cat’ is a noun because it is the name of an animal."
  },
  {
    id: "q2",
    sentence: "The cat is eating the bread enthusiastically.",
    word: "eating",
    correctAnswer: "Pandiwa",
    hint: "It shows an action.",
    explanation: "‘Eating’ is a verb because it shows the action being done."
  },
  {
    id: "q3",
    sentence: "The cat is eating the bread enthusiastically.",
    word: "enthusiastically",
    correctAnswer: "Pang-abay",
    hint: "It describes how the action is done.",
    explanation: "‘Enthusiastically’ is an adverb because it tells how the action is performed."
  },
  {
    id: "q4",
    sentence: "Maria sings beautifully in the school program.",
    word: "sings",
    correctAnswer: "Pandiwa",
    hint: "It shows an action.",
    explanation: "‘Sings’ is a verb because it describes what Maria does."
  },
  {
    id: "q5",
    sentence: "Maria sings beautifully in the school program.",
    word: "beautifully",
    correctAnswer: "Pang-abay",
    hint: "It tells us how Maria sings.",
    explanation: "‘Beautifully’ is an adverb because it describes the manner of singing."
=======
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
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
  }
];


<<<<<<< HEAD

=======
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
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