// data/games/parts-of-speech.ts

import { PartsOfSpeechQuestion } from "@/types/games";

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