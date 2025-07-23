"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Database simulation for Sentence Construction Challenge
const SENTENCE_REARRANGEMENT_DATABASE = [
  {
    id: 1,
    difficulty: "easy",
    fragments: ["Ang", "bata", "ay", "naglalaro", "sa", "parke"],
    correctSentence: "Ang bata ay naglalaro sa parke",
    translation: "The child is playing in the park",
    category: "daily_activities"
  },
  {
    id: 2,
    difficulty: "easy",
    fragments: ["Kumakain", "ako", "ng", "mansanas"],
    correctSentence: "Kumakain ako ng mansanas",
    translation: "I am eating an apple",
    category: "food"
  },
  {
    id: 3,
    difficulty: "easy",
    fragments: ["Natutulog", "ang", "pusa", "sa", "kama"],
    correctSentence: "Natutulog ang pusa sa kama",
    translation: "The cat is sleeping on the bed",
    category: "animals"
  },
  {
    id: 4,
    difficulty: "medium",
    fragments: ["Nagbabasa", "ng", "libro", "ang", "mga", "estudyante", "sa", "silid-aralan"],
    correctSentence: "Nagbabasa ng libro ang mga estudyante sa silid-aralan",
    translation: "The students are reading books in the classroom",
    category: "education"
  },
  {
    id: 5,
    difficulty: "medium",
    fragments: ["Masayang", "nagsasayaw", "ang", "mga", "tao", "sa", "pista"],
    correctSentence: "Masayang nagsasayaw ang mga tao sa pista",
    translation: "People are happily dancing at the festival",
    category: "celebrations"
  },
  {
    id: 6,
    difficulty: "medium",
    fragments: ["Nagluluto", "ng", "adobo", "ang", "nanay", "para", "sa", "hapunan"],
    correctSentence: "Nagluluto ng adobo ang nanay para sa hapunan",
    translation: "Mother is cooking adobo for dinner",
    category: "food"
  },
  {
    id: 7,
    difficulty: "hard",
    fragments: ["Nag-aaral", "ng", "Filipino", "ang", "mga", "dayuhan", "upang", "maintindihan", "ang", "kultura"],
    correctSentence: "Nag-aaral ng Filipino ang mga dayuhan upang maintindihan ang kultura",
    translation: "Foreigners are studying Filipino to understand the culture",
    category: "education"
  },
  {
    id: 8,
    difficulty: "hard",
    fragments: ["Pinapahalagahan", "namin", "ang", "kalikasan", "dahil", "ito", "ay", "biyaya", "ng", "Diyos"],
    correctSentence: "Pinapahalagahan namin ang kalikasan dahil ito ay biyaya ng Diyos",
    translation: "We value nature because it is a gift from God",
    category: "environment"
  }
];

export default function SentenceConstructionChallenge() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [draggedFragments, setDraggedFragments] = useState([]);
  const [availableFragments, setAvailableFragments] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setFeedback("");
    setCurrentQuestionIndex(0);
    loadNewQuestion();
  };

  const loadNewQuestion = () => {
    const filteredQuestions = SENTENCE_REARRANGEMENT_DATABASE.filter(q => q.difficulty === difficulty);
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    
    setCurrentQuestion(randomQuestion);
    setShowTranslation(false);
    setFeedback("");
    
    // Shuffle fragments
    const shuffled = [...randomQuestion.fragments].sort(() => Math.random() - 0.5);
    setAvailableFragments(shuffled);
    setDraggedFragments([]);
  };

  const handleFragmentClick = (fragment, index) => {
    // Move fragment from available to dragged
    setAvailableFragments(prev => prev.filter((_, i) => i !== index));
    setDraggedFragments(prev => [...prev, fragment]);
  };

  const handleDraggedFragmentClick = (fragment, index) => {
    // Move fragment back to available
    setDraggedFragments(prev => prev.filter((_, i) => i !== index));
    setAvailableFragments(prev => [...prev, fragment]);
  };

  const checkAnswer = () => {
    const constructedSentence = draggedFragments.join(" ");
    const isCorrect = constructedSentence.toLowerCase() === currentQuestion.correctSentence.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback("🎉 Tama! Magaling ka!");
      setTimeout(() => {
        loadNewQuestion();
      }, 2000);
    } else {
      setLives(prev => prev - 1);
      setFeedback(`❌ Hindi tama. Tamang sagot: "${currentQuestion.correctSentence}"`);
      
      if (lives <= 1) {
        setFeedback("💔 Game Over! Subukan ulit.");
        setTimeout(() => {
          setGameStarted(false);
        }, 3000);
      } else {
        setTimeout(() => {
          loadNewQuestion();
        }, 3000);
      }
    }
  };

  const resetFragments = () => {
    if (currentQuestion) {
      const shuffled = [...currentQuestion.fragments].sort(() => Math.random() - 0.5);
      setAvailableFragments(shuffled);
      setDraggedFragments([]);
    }
  };

  if (!gameStarted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-purple-300 px-4 overflow-hidden">
        <Image
          src="/images/login-art.svg"
          alt="Background Art"
          fill
          className="absolute z-0"
          priority
        />

        <div className="relative z-10 w-full max-w-[630px] bg-white rounded-2xl shadow-md p-8 flex flex-col justify-between">
          <div className="flex flex-col items-center space-y-2">
            <Image
              src="/images/aralila-logo-tr.svg"
              alt="Aralila Logo"
              width={150}
              height={200}
              className="object-contain"
            />
            <h1 className="text-xl font-bold text-center text-purple-500">
              Sentence Construction Challenge
            </h1>
            <p className="text-sm text-center text-gray-600">
              Pagsulat, Pag-unlad, Pagwawagi!
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                🔤 Ayusin ang Pangungusap
              </h2>
              <p className="text-sm text-gray-600">
                I-click ang mga salita upang makabuo ng tamang pangungusap sa Filipino
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pumili ng Difficulty:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">Madali (3-5 salita)</option>
                <option value="medium">Katamtaman (6-8 salita)</option>
                <option value="hard">Mahirap (9+ salita)</option>
              </select>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Magsimula ng Laro
            </button>
          </div>

          <p className="text-xs md:text-sm text-center text-gray-600 font-semibold">
            Bumalik sa{" "}
            <Link href="/dashboard" className="text-purple-700 hover:underline">
              Dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-purple-300 px-4 overflow-hidden">
      <Image
        src="/images/login-art.svg"
        alt="Background Art"
        fill
        className="absolute z-0"
        priority
      />

      <div className="relative z-10 w-full max-w-[800px] bg-white rounded-2xl shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/aralila-logo-tr.svg"
              alt="Aralila Logo"
              width={50}
              height={50}
              className="object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-purple-600">
                🔤 Sentence Construction Challenge
              </h1>
              <p className="text-xs text-gray-500">Difficulty: {difficulty}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-semibold text-green-600">
              Score: {score}
            </div>
            <div className="text-sm font-semibold text-red-600">
              Lives: {"❤️".repeat(lives)}
            </div>
          </div>
        </div>

        {/* Game Content */}
        {currentQuestion && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">
                Ayusin ang mga salita upang makabuo ng tamang pangungusap:
              </h2>
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {showTranslation ? "Itago" : "Ipakita"} ang Translation
                </button>
              </div>
              {showTranslation && (
                <p className="text-sm text-gray-600 mt-2">
                  Translation: {currentQuestion.translation}
                </p>
              )}
            </div>

            {/* Constructed Sentence Area */}
            <div className="bg-gray-50 p-4 rounded-lg min-h-[80px] border-2 border-dashed border-gray-300">
              <div className="text-sm text-gray-600 mb-2">Pangungusap na Nabuo:</div>
              <div className="flex flex-wrap gap-2">
                {draggedFragments.map((fragment, index) => (
                  <button
                    key={index}
                    onClick={() => handleDraggedFragmentClick(fragment, index)}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-300 hover:bg-purple-200 transition-colors"
                  >
                    {fragment}
                  </button>
                ))}
                {draggedFragments.length === 0 && (
                  <div className="text-gray-400 italic">I-click ang mga salita sa ibaba...</div>
                )}
              </div>
            </div>

            {/* Available Fragments */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Mga Salitang Magagamit:</div>
              <div className="flex flex-wrap gap-2">
                {availableFragments.map((fragment, index) => (
                  <button
                    key={index}
                    onClick={() => handleFragmentClick(fragment, index)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-300 hover:bg-blue-200 transition-colors"
                  >
                    {fragment}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetFragments}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 Reset
              </button>
              <button
                onClick={checkAnswer}
                disabled={draggedFragments.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ✅ Sagot
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center p-4 rounded-lg ${
                feedback.includes("Tama") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                <div className="font-semibold">{feedback}</div>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-purple-600 hover:underline text-sm">
            ← Bumalik sa Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}