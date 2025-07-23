"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Database simulation for Emoji Sentence Challenge
const EMOJI_SENTENCE_DATABASE = [
  {
    id: 1,
    difficulty: "easy",
    emojis: ["👦", "🏃", "🏠"],
    correctSentence: "Ang bata ay tumatakbo sa bahay",
    translation: "The child is running to the house",
    hint: "Ano ang ginagawa ng bata?",
    category: "actions"
  },
  {
    id: 2,
    difficulty: "easy",
    emojis: ["👩", "🍳", "🍚"],
    correctSentence: "Ang nanay ay nagluluto ng kanin",
    translation: "The mother is cooking rice",
    hint: "Ano ang ginagawa ng nanay sa kusina?",
    category: "cooking"
  },
  {
    id: 3,
    difficulty: "easy",
    emojis: ["🐱", "😴", "🛏️"],
    correctSentence: "Ang pusa ay natutulog sa kama",
    translation: "The cat is sleeping on the bed",
    hint: "Saan natutulog ang pusa?",
    category: "animals"
  },
  {
    id: 4,
    difficulty: "easy",
    emojis: ["☀️", "🌅", "🐓"],
    correctSentence: "Sumikat ang araw at umaga na",
    translation: "The sun rose and it's morning",
    hint: "Anong oras ito?",
    category: "time"
  },
  {
    id: 5,
    difficulty: "medium",
    emojis: ["👨‍🎓", "📚", "🏫"],
    correctSentence: "Ang guro ay nagtuturo sa paaralan",
    translation: "The teacher is teaching at school",
    hint: "Sino ang nagtuturo sa mga estudyante?",
    category: "education"
  },
  {
    id: 6,
    difficulty: "medium",
    emojis: ["🌧️", "☂️", "👧"],
    correctSentence: "Dahil sa ulan ang bata ay gumagamit ng payong",
    translation: "Because of the rain the child is using an umbrella",
    hint: "Bakit gumagamit ng payong ang bata?",
    category: "weather"
  },
  {
    id: 7,
    difficulty: "medium",
    emojis: ["🎉", "🎂", "👶"],
    correctSentence: "Nagdiriwang kami ng kaarawan ng sanggol",
    translation: "We are celebrating the baby's birthday",
    hint: "Anong okasyon ito?",
    category: "celebrations"
  },
  {
    id: 8,
    difficulty: "medium",
    emojis: ["🚗", "🛣️", "🏔️"],
    correctSentence: "Naglalakbay kami sa bundok gamit ang kotse",
    translation: "We are traveling to the mountain using a car",
    hint: "Saan kayo pupunta?",
    category: "travel"
  },
  {
    id: 9,
    difficulty: "hard",
    emojis: ["👨‍⚕️", "🏥", "🤒", "💊"],
    correctSentence: "Ang doktor ay nag-gamot sa maysakit sa ospital",
    translation: "The doctor treated the sick person at the hospital",
    hint: "Sino ang nag-aalaga sa mga maysakit?",
    category: "health"
  },
  {
    id: 10,
    difficulty: "hard",
    emojis: ["🌱", "🌳", "🌍", "💚"],
    correctSentence: "Nag-aani kami ng mga puno para sa kalikasan",
    translation: "We are planting trees for the environment",
    hint: "Paano natin maalagaan ang kapaligiran?",
    category: "environment"
  },
  {
    id: 11,
    difficulty: "hard",
    emojis: ["📖", "🕯️", "🌙", "👵"],
    correctSentence: "Nagbabasa ang lola ng kuwento sa ilalim ng liwanag ng kandila",
    translation: "Grandmother is reading a story under the candlelight",
    hint: "Anong ginagawa ng lola sa gabi?",
    category: "family"
  }
];

export default function EmojiSentenceChallenge() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setFeedback("");
    setAttempts(0);
    loadNewQuestion();
  };

  const loadNewQuestion = () => {
    const filteredQuestions = EMOJI_SENTENCE_DATABASE.filter(q => q.difficulty === difficulty);
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    
    setCurrentQuestion(randomQuestion);
    setUserAnswer("");
    setShowHint(false);
    setShowTranslation(false);
    setFeedback("");
    setAttempts(0);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      setFeedback("⚠️ Mangyaring maglagay ng sagot!");
      return;
    }

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctSentence.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 15);
      setFeedback("🎉 Tama! Napakagaling mo!");
      setTimeout(() => {
        loadNewQuestion();
      }, 2500);
    } else {
      setAttempts(prev => prev + 1);
      
      if (attempts >= 1) {
        setLives(prev => prev - 1);
        setFeedback(`❌ Hindi tama. Tamang sagot: "${currentQuestion.correctSentence}"`);
        
        if (lives <= 1) {
          setFeedback("💔 Game Over! Subukan ulit ang laro.");
          setTimeout(() => {
            setGameStarted(false);
          }, 3000);
        } else {
          setTimeout(() => {
            loadNewQuestion();
          }, 4000);
        }
      } else {
        setFeedback("❌ Hindi tama. Subukan ulit! (Isa pang pagkakataon)");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
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
              Emoji Sentence Challenge
            </h1>
            <p className="text-sm text-center text-gray-600">
              Pagsulat, Pag-unlad, Pagwawagi!
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                😀 Hulaan ang Pangungusap
              </h2>
              <p className="text-sm text-gray-600">
                Tingnan ang mga emoji at hulaan kung anong pangungusap ang kinakatawan nito
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
                <option value="easy">Madali (3 emoji)</option>
                <option value="medium">Katamtaman (4 emoji)</option>
                <option value="hard">Mahirap (4+ emoji)</option>
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Mga Tip:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Tingnan mabuti ang mga emoji</li>
                <li>• Gamitin ang "Hint" kung kailangan</li>
                <li>• Isulat ang buong pangungusap sa Filipino</li>
                <li>• May dalawang pagkakataon ka sa bawat tanong</li>
              </ul>
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

      <div className="relative z-10 w-full max-w-[700px] bg-white rounded-2xl shadow-md p-6">
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
                😀 Emoji Sentence Challenge
              </h1>
              <p className="text-xs text-gray-500">Difficulty: {difficulty}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-semibold text-green-600">
              Score: {score}
            </div>
            <div className="text-sm font-semibold text-red-600 flex items-center space-x-1">
                <span>Buhay:</span>
                {[...Array(3)].map((_, index) => (
                    <span key={index}>
                    {index < lives ? "❤️" : "🤍"}
                    </span>
                ))}
            </div>
          </div>
        </div>

        {/* Game Content */}
        {currentQuestion && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">
                Anong pangungusap ang kinakatawan ng mga emoji na ito?
              </h2>
              
              {/* Emoji Display */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl mb-4">
                <div className="flex justify-center items-center space-x-4">
                  {currentQuestion.emojis.map((emoji, index) => (
                    <div key={index} className="text-6xl animate-bounce" style={{animationDelay: `${index * 0.2}s`}}>
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hint and Translation Buttons */}
              <div className="flex justify-center items-center space-x-4 mb-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  {showHint ? "Itago ang Hint" : "💡 Ipakita ang Hint"}
                </button>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {showTranslation ? "Itago" : "🌐 Translation"}
                </button>
              </div>

              {/* Hint Display */}
              {showHint && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                  <div className="text-sm text-yellow-800">
                    <strong>Hint:</strong> {currentQuestion.hint}
                  </div>
                </div>
              )}

              {/* Translation Display */}
              {showTranslation && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <div className="text-sm text-blue-800">
                    <strong>Translation:</strong> {currentQuestion.translation}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isulat ang pangungusap sa Filipino:
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Halimbawa: Ang bata ay naglalaro sa parke"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  disabled={feedback.includes("Tama") || feedback.includes("Game Over")}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setUserAnswer("")}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🗑️ Clear
                </button>
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim() || feedback.includes("Tama") || feedback.includes("Game Over")}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ✅ Sagot
                </button>
              </div>

              {/* Attempts Counter */}
              {attempts > 0 && attempts < 2 && !feedback.includes("Tama") && (
                <div className="text-center">
                  <div className="text-sm text-orange-600">
                    Natitira pang pagkakataon: {2 - attempts}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center p-4 rounded-lg ${
                feedback.includes("Tama") 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : feedback.includes("Game Over")
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : feedback.includes("Mangyaring")
                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                <div className="font-semibold">{feedback}</div>
                {feedback.includes("Tamang sagot") && (
                  <div className="text-sm mt-2 opacity-80">
                    Translation: {currentQuestion.translation}
                  </div>
                )}
              </div>
            )}

            {/* Progress Indicator */}
            <div className="text-center">
              <div className="text-xs text-gray-500">
                Category: {currentQuestion.category} | Difficulty: {difficulty}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <Link href="/dashboard" className="text-purple-600 hover:underline text-sm">
            ← Bumalik sa Dashboard
          </Link>
          <button
            onClick={() => setGameStarted(false)}
            className="text-sm bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  );
}