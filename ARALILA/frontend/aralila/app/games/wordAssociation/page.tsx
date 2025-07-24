'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Trophy, RotateCcw,
  HelpCircle, ArrowLeft, Clock, Heart, Star
} from 'lucide-react';

import { fourPicsOneWordQuestions as originalQuestions } from '@/data/WordAssociationData';

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Adaptive difficulty based on progress
function generateAdaptiveQuestionSet(progress: number): typeof originalQuestions {
  const easy = shuffleArray(originalQuestions.filter(q => q.difficulty === 'easy'));
  const medium = shuffleArray(originalQuestions.filter(q => q.difficulty === 'medium'));
  const hard = shuffleArray(originalQuestions.filter(q => q.difficulty === 'hard'));

  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  if (progress < 5) {
    easyCount = 4;
    mediumCount = 1;
  } else if (progress < 10) {
    easyCount = 2;
    mediumCount = 2;
    hardCount = 1;
  } else if (progress < 20) {
    easyCount = 1;
    mediumCount = 3;
    hardCount = 1;
  } else {
    easyCount = 0;
    mediumCount = 2;
    hardCount = 3;
  }

  const result = [
    ...easy.slice(0, easyCount),
    ...medium.slice(0, mediumCount),
    ...hard.slice(0, hardCount),
  ];

  return shuffleArray(result);
}

export default function FilipinoGuessingGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [shuffledQuestions, setShuffledQuestions] = useState(() => generateAdaptiveQuestionSet(0));

  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuestion = shuffledQuestions[currentIndex];

  useEffect(() => {
    if (timeLeft <= 0 || lives <= 0) {
      setGameComplete(true);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, lives]);

  const handleSubmit = () => {
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedAnswer = currentQuestion.answer.toLowerCase();

    if (normalizedInput === normalizedAnswer) {
      const newStreak = streak + 1;
      const newCombo = newStreak % 3 === 0 ? combo + 1 : combo;
      setScore(score + 100 * combo);
      setStreak(newStreak);
      setCombo(newCombo);
      showTemporaryFeedback("Tama!");
      setTimeout(goToNext, 1500);
    } else {
      setLives(lives - 1);
      setStreak(0);
      setCombo(1);
      showTemporaryFeedback("Mali!");
    }

    setUserInput("");
  };

  const goToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= shuffledQuestions.length) {
      const newSet = generateAdaptiveQuestionSet(nextIndex);
      setShuffledQuestions(newSet);
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const showTemporaryFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1000);
  };

  const handleRestart = () => {
    setShuffledQuestions(generateAdaptiveQuestionSet(0));
    setCurrentIndex(0);
    setUserInput("");
    setScore(0);
    setCombo(1);
    setStreak(0);
    setLives(3);
    setGameComplete(false);
    setTimeLeft(60);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4 relative">
      <Link href="/" className="absolute top-4 left-4 z-50">
        <button className="p-3 bg-purple-700 text-purple-200 rounded-full shadow-lg hover:bg-purple-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </Link>

      {/* HUD */}
      <div className="max-w-2xl mx-auto mb-6 bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl border border-purple-700 p-4">
        <div className="flex justify-between items-center text-purple-100">
          <div className="flex items-center space-x-4">
            <Clock className="w-6 h-6 text-purple-300" />
            <span className="text-lg font-bold">{timeLeft}s</span>
            <Heart className="w-6 h-6 text-red-400 ml-4" />
            <span className="text-lg font-bold">{lives}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Star className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-bold text-yellow-300">x{combo}</span>
            <Trophy className="w-6 h-6 text-purple-300" />
            <span className="text-lg font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Game Box */}
      <div className="max-w-6xl mx-auto bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-700 p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
          <div className="flex-[3] grid grid-cols-2 gap-4">
            {currentQuestion.images.map((src, idx) => (
              <div key={idx} className="w-full aspect-square rounded-xl overflow-hidden border border-purple-600 shadow-md">
                <Image src={src} alt={`Clue ${idx + 1}`} width={512} height={512} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="flex-[1] w-full md:min-w-[250px] md:max-w-sm">
            <div
              className={`h-6 text-center text-lg font-bold mb-3 transition-opacity duration-300 ${
                showFeedback
                  ? feedbackMessage === 'Tama!'
                    ? 'text-green-400 opacity-100'
                    : 'text-red-400 opacity-100'
                  : 'opacity-0'
              }`}
            >
              {feedbackMessage}
            </div>

            <input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="I-type ang sagot..."
              className="w-full px-4 py-3 rounded-xl border border-purple-600 bg-purple-800 text-white font-semibold tracking-widest text-lg text-center mb-3"
            />
            {currentQuestion && (
              <div className="text-purple-300 text-sm mb-2 flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" /> Hint: <span className="italic">{currentQuestion.hint || "Wala"}</span>
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-900"
            >
              SAGOT
            </button>
          </div>
        </div>
      </div>

      {gameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-900 bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-purple-700 max-w-sm w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Tapos Na!</h2>
            <p className="text-purple-200 text-lg mb-4">
              Kabuuang puntos: <span className="text-yellow-400 font-bold">{score}</span>
            </p>
            <button
              onClick={handleRestart}
              className="flex items-center justify-center mx-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-900"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Subukan Muli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
