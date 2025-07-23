"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, Star, RotateCcw, Trophy, BookOpen, Eye, EyeOff, Clock, Zap, Heart, Target, Flame, Volume2, VolumeX, ArrowLeft, HelpCircle, Trash2 } from 'lucide-react';
import { emojiSentenceChallenges } from '@/data/EmojiData';

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
  const [gameComplete, setGameComplete] = useState(false);
  const [showDifficultySelection, setShowDifficultySelection] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleStartGameClick = () => {
    setShowDifficultySelection(true);
  };

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setShowDifficultySelection(false);
    setScore(0);
    setLives(3);
    setFeedback("");
    setAttempts(0);
    setGameComplete(false);
    loadNewQuestion(selectedDifficulty);
  };

  const loadNewQuestion = (diff = difficulty) => {
    const filteredQuestions = emojiSentenceChallenges.filter(q => q.difficulty === diff);

    if (filteredQuestions.length === 0) return;

    let newQuestion = null;
    let attempts = 0;

    // Try to find a different question (max 10 tries to avoid infinite loop)
    do {
      newQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      attempts++;
    } while (newQuestion?.id === currentQuestion?.id && attempts < 10);

    setCurrentQuestion(newQuestion);
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
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameComplete(true);
          }
          return newLives;
        });
        setFeedback(`❌ Hindi tama. Tamang sagot: "${currentQuestion.correctSentence}"`);
        
        if (lives <= 1) {
          setTimeout(() => {
            setGameComplete(true);
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

  const resetGame = () => {
    setCurrentQuestion(null);
    setUserAnswer("");
    setScore(0);
    setLives(3);
    setFeedback("");
    setDifficulty("easy");
    setGameStarted(false);
    setShowHint(false);
    setShowTranslation(false);
    setAttempts(0);
    setGameComplete(false);
    setShowDifficultySelection(false);
    setShowHowToPlay(false);
  };

  // Game Complete Screen
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <div className="text-6xl mb-4 text-white">💔</div>
              <h1 className="text-4xl font-bold text-white mb-2">Tapos Na ang Laro!</h1>
              <p className="text-xl text-purple-200 mb-6">Wala Nang Buhay!</p>

              <div className="bg-purple-800 rounded-2xl p-6 mb-6 border border-purple-600">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-purple-700 rounded-xl p-4 border border-purple-500 text-purple-100">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-purple-200">Huling Puntos</p>
                    <p className="text-4xl font-bold text-yellow-400">{score}</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-4 border border-purple-500 text-purple-100">
                    <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-purple-200">Antas</p>
                    <p className="text-2xl font-bold text-green-400 capitalize">{difficulty}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={resetGame}
                className="flex items-center justify-center mx-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-900 hover:border-b-2"
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                Maglaro Muli!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (showDifficultySelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <h2 className="text-3xl font-bold text-white mb-6">Piliin ang Antas ng Hamon:</h2>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => startGame('easy')}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-green-800 hover:border-b-2"
                >
                  😊 Madali (3 emoji)
                </button>
                <button
                  onClick={() => startGame('medium')}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xl font-bold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-yellow-800 hover:border-b-2"
                >
                  🤔 Katamtaman (4 emoji)
                </button>
                <button
                  onClick={() => startGame('hard')}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xl font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-red-800 hover:border-b-2"
                >
                  🧠 Mahirap (4+ emoji)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Menu Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <div className="flex items-center justify-center mb-6">
                <div className="text-6xl">😀</div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Emoji Sentence Challenge</h1>
              <div className="bg-purple-800 rounded-2xl p-6 mb-6 border border-purple-600">
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-purple-300 mr-3" />
                  <p className="text-2xl font-semibold text-purple-100">Hulaan ang Pangungusap!</p>
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm mb-4">
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="font-semibold text-blue-300">Tingnan ang Mga Emoji</p>
                    <p className="text-purple-200">Hulaan kung anong pangungusap ang kinakatawan</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="font-semibold text-red-300">3 Buhay</p>
                    <p className="text-purple-200">Dalawang pagkakataon sa bawat tanong</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-300">Pahiwatig at Salin</p>
                    <p className="text-purple-200">Gamitin kung kailangan mo ng tulong</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={handleStartGameClick}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-900 hover:border-b-2"
                >
                  SIMULAN ANG LARO! 
                </button>
                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="p-3 bg-purple-700 text-purple-200 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
                  title="Paano Maglaro?"
                >
                  <HelpCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How to Play Modal */}
        {showHowToPlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-purple-900 bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-purple-700 max-w-lg w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Paano Maglaro?</h3>
              <div className="text-purple-200 mb-6 text-left space-y-3">
                <p>🎯 <strong>Layunin:</strong> Hulaan ang tamang pangungusap na kinakatawan ng mga emoji</p>
                <p>👀 <strong>Mga Hakbang:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Tingnan mabuti ang mga emoji</li>
                  <li>Mag-isip ng pangungusap sa Filipino</li>
                  <li>Isulat ang inyong sagot sa text box</li>
                  <li>Gamitin ang hint at translation kung kailangan</li>
                </ul>
                <p>💡 <strong>Mga Tip:</strong> May dalawang pagkakataon ka sa bawat tanong bago mawalan ng buhay!</p>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-900 hover:border-b-2"
              >
                Nakuha Ko!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4">
      {/* Back button */}
      <div className="fixed top-4 left-4 flex items-center space-x-4 z-50">
        <button
          onClick={resetGame}
          className="p-3 bg-purple-700 text-purple-200 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
          title="Bumalik sa Menu"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header with stats */}
        <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl p-6 mb-6 border border-purple-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-2xl font-bold text-yellow-400">{score}</span>
              </div>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  difficulty === 'easy' ? 'bg-green-600 bg-opacity-50 text-white' :
                  difficulty === 'medium' ? 'bg-yellow-600 bg-opacity-50 text-white' :
                  'bg-red-600 bg-opacity-50 text-white'
                }`}>
                  {difficulty === 'easy' ? 'Madali' : difficulty === 'medium' ? 'Katamtaman' : 'Mahirap'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 ${i < lives ? 'text-red-400 fill-red-400' : 'text-purple-500'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main game card */}
        {currentQuestion && (
          <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-purple-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Anong pangungusap ang kinakatawan ng mga emoji na ito?</h2>
            </div>

            {/* Emoji Display */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 bg-opacity-50 rounded-2xl p-8 mb-6 border border-purple-600">
              <div className="flex justify-center items-center space-x-6">
                {currentQuestion.emojis.map((emoji, index) => (
                  <div 
                    key={index} 
                    className="text-8xl animate-bounce bg-white bg-opacity-10 rounded-2xl p-4" 
                    style={{animationDelay: `${index * 0.2}s`}}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Hint and Translation Buttons */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center px-6 py-3 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
              >
                <Eye className="w-5 h-5 mr-2" />
                {showHint ? "Itago ang Hint" : "💡 Ipakita ang Hint"}
              </button>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center px-6 py-3 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {showTranslation ? "Itago" : "🌐 Translation"}
              </button>
            </div>

            {/* Hint Display */}
            {showHint && (
              <div className="bg-yellow-600 bg-opacity-30 border border-yellow-400 text-yellow-200 p-4 rounded-2xl mb-6">
                <div className="text-center">
                  <strong>Hint:</strong> {currentQuestion.hint}
                </div>
              </div>
            )}

            {/* Translation Display */}
            {showTranslation && (
              <div className="bg-blue-600 bg-opacity-30 border border-blue-400 text-blue-200 p-4 rounded-2xl mb-6">
                <div className="text-center">
                  <strong>Translation:</strong> {currentQuestion.translation}
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-lg font-medium text-purple-200 mb-3 text-center">
                  Isulat ang pangungusap sa Filipino:
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Halimbawa: Ang bata ay naglalaro sa parke"
                  className="w-full p-4 border border-purple-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg bg-purple-800 bg-opacity-50 text-white placeholder-purple-300"
                  disabled={feedback.includes("Tama") || feedback.includes("Game Over")}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setUserAnswer("")}
                className="flex items-center px-6 py-3 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear
              </button>
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim() || feedback.includes("Tama") || feedback.includes("Game Over")}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-green-800 hover:border-b-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Sagot
              </button>
            </div>

            {/* Attempts Counter */}
            {attempts > 0 && attempts < 2 && !feedback.includes("Tama") && (
              <div className="text-center mb-4">
                <div className="text-orange-300 font-medium">
                  Natitira pang pagkakataon: {2 - attempts}
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`text-center p-6 rounded-2xl mb-6 border-2 ${
                feedback.includes("Tama") 
                  ? 'bg-green-600 bg-opacity-30 border-green-400 text-green-200'
                  : feedback.includes("Game Over")
                  ? 'bg-red-600 bg-opacity-30 border-red-400 text-red-200'
                  : feedback.includes("Mangyaring")
                  ? 'bg-orange-600 bg-opacity-30 border-orange-400 text-orange-200'
                  : 'bg-red-600 bg-opacity-30 border-red-400 text-red-200'
              }`}>
                <div className="text-xl font-bold mb-2 flex items-center justify-center">
                  {feedback.includes("Tama") ? <CheckCircle className="w-7 h-7 mr-2" /> : <XCircle className="w-7 h-7 mr-2" />}
                  {feedback}
                </div>
                {feedback.includes("Tamang sagot") && (
                  <div className="text-sm mt-2 opacity-80">
                    Translation: {currentQuestion.translation}
                  </div>
                )}
              </div>
            )}

            {/* Progress Indicator */}
            <div className="text-center">
              <div className="text-sm text-purple-300">
                Category: {currentQuestion.category}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}