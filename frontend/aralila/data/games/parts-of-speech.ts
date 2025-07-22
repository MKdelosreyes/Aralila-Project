// data/games/parts-of-speech.ts

import { PartsOfSpeechQuestion } from "@/types/games";

export const partsOfSpeechData: PartsOfSpeechQuestion[] = [
  {
    id: 'pos-1',
    sentence: "The **quick** brown fox jumps over the lazy dog.",
    word: "quick",
    options: ["Noun", "Verb", "Adjective", "Adverb"],
    correctAnswer: "Adjective",
    hint: "This word describes the fox.",
    explanation: "An adjective describes a noun or pronoun. 'Quick' describes the noun 'fox'."
  },
  {
    id: 'pos-2',
    sentence: "She **runs** every morning.",
    word: "runs",
    options: ["Noun", "Verb", "Adjective", "Preposition"],
    correctAnswer: "Verb",
    hint: "This word shows an action.",
    explanation: "A verb expresses an action, existence, or occurrence. 'Runs' is the action she performs."
  },
  {
    id: 'pos-3',
    sentence: "The book is **on** the table.",
    word: "on",
    options: ["Noun", "Verb", "Adverb", "Preposition"],
    correctAnswer: "Preposition",
    hint: "This word shows the relationship between the book and the table.",
    explanation: "A preposition shows the relationship of a noun or pronoun to other words in the sentence, often indicating position or direction."
  },
  {
    id: 'pos-4',
    sentence: "**Happiness** is a state of mind.",
    word: "Happiness",
    options: ["Noun", "Adjective", "Adverb", "Interjection"],
    correctAnswer: "Noun",
    hint: "This is a thing or concept.",
    explanation: "A noun is a person, place, thing, or idea. 'Happiness' is an abstract noun."
  },
  {
    id: 'pos-5',
    sentence: "He spoke **softly** to the child.",
    word: "softly",
    options: ["Adjective", "Adverb", "Verb", "Conjunction"],
    correctAnswer: "Adverb",
    hint: "This word describes how he spoke.",
    explanation: "An adverb modifies a verb, an adjective, or another adverb. 'Softly' describes the verb 'spoke'."
  },
  // Add more questions for different difficulties
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