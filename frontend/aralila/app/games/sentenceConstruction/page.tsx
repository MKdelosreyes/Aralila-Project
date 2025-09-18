"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Star, RotateCcw, Trophy, BookOpen, Eye, EyeOff, Clock, Zap, Heart, Target, Flame, Volume2, VolumeX, ArrowLeft, HelpCircle } from 'lucide-react';
import { sentenceArrangementChallenges } from '@/data/SentenceConstructionData';

export default function SentenceConstructionChallenge() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [draggedFragments, setDraggedFragments] = useState([]);
  const [availableFragments, setAvailableFragments] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const [showDifficultySelection, setShowDifficultySelection] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

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
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setGameComplete(false);
    loadNewQuestion(selectedDifficulty);
  };

  const loadNewQuestion = (selectedDifficulty = difficulty) => {
    const filteredQuestions = sentenceArrangementChallenges.filter(q => q.difficulty === selectedDifficulty);
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    
    setCurrentQuestion(randomQuestion);
    setShowTranslation(false);
    setFeedback("");
    setShowFeedback(false);
    
    // Shuffle fragments
    const shuffled = [...randomQuestion.fragments].sort(() => Math.random() - 0.5);
    setAvailableFragments(shuffled);
    setDraggedFragments([]);
  };

  const handleFragmentClick = (fragment, index) => {
    if (showFeedback) return;
    
    // Move fragment from available to dragged
    setAvailableFragments(prev => prev.filter((_, i) => i !== index));
    setDraggedFragments(prev => [...prev, fragment]);
  };

  const handleDraggedFragmentClick = (fragment, index) => {
    if (showFeedback) return;
    
    // Move fragment back to available
    setDraggedFragments(prev => prev.filter((_, i) => i !== index));
    setAvailableFragments(prev => [...prev, fragment]);
  };

  const checkAnswer = () => {
    if (!currentQuestion || showFeedback) return;
    
    const constructedSentence = draggedFragments.join(" ");
    const isCorrect = constructedSentence.toLowerCase() === currentQuestion.correctSentence.toLowerCase();
    
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);
    setQuestionsAnswered(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback("🎉 Tama! Magaling ka!");
      setTimeout(() => {
        loadNewQuestion();
      }, 2000);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback(`❌ Hindi tama. Tamang sagot: "${currentQuestion.correctSentence}"`);
      
      if (newLives <= 0) {
        setGameComplete(true);
        setTimeout(() => {
          setFeedback("💔 Game Over! Subukan ulit.");
        }, 1000);
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

  const resetGame = () => {
    setCurrentQuestion(null);
    setDraggedFragments([]);
    setAvailableFragments([]);
    setScore(0);
    setLives(3);
    setFeedback("");
    setDifficulty("easy");
    setGameStarted(false);
    setShowDifficultySelection(false);
    setCurrentQuestionIndex(0);
    setShowTranslation(false);
    setShowFeedback(false);
    setLastAnswerCorrect(false);
    setGameComplete(false);
    setQuestionsAnswered(0);
  };

  if (!gameStarted && !showDifficultySelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <div className="flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 text-purple-300" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Sentence Construction Challenge</h1>
              <div className="bg-purple-800 rounded-2xl p-6 mb-6 border border-purple-600">
                <div className="flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-purple-300 mr-3" />
                  <p className="text-2xl font-semibold text-purple-100">Ayusin ang Pangungusap!</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="font-semibold text-red-300">3 Buhay</p>
                    <p className="text-purple-200">Mawawalan ng isa sa bawat maling sagot</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-300">Sistema ng Puntos</p>
                    <p className="text-purple-200">10 puntos sa bawat tamang sagot</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <BookOpen className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="font-semibold text-green-300">I-click ang Salita</p>
                    <p className="text-purple-200">Para makabuo ng pangungusap</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="font-semibold text-blue-300">May Translation</p>
                    <p className="text-purple-200">Tulong sa pag-unawa</p>
                  </div>
                </div>
                <div className="bg-purple-700 rounded-xl p-4 border border-purple-500">
                  <p className="font-bold text-purple-100 mb-2">PAANO MAGLARO:</p>
                  <p className="text-sm text-purple-200">
                    I-click ang mga salita sa tamang pagkakasunod-sunod upang makabuo ng wastong pangungusap sa Filipino!
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartGameClick}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-900 hover:border-b-2"
              >
                SIMULAN ANG LARO!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  Madali (3-5 salita)
                </button>
                <button
                  onClick={() => startGame('medium')}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xl font-bold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-yellow-800 hover:border-b-2"
                >
                  Katamtaman (6-8 salita)
                </button>
                <button
                  onClick={() => startGame('hard')}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xl font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-red-800 hover:border-b-2"
                >
                  Mahirap (9+ salita)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <p className="text-lg font-semibold text-purple-200">Mga Tanong</p>
                    <p className="text-4xl font-bold text-green-400">{questionsAnswered}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4">
      {/* Control Buttons */}
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
                <Target className="w-6 h-6 text-green-400 mr-2" />
                <span className="text-2xl font-bold text-green-400">{questionsAnswered}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Difficulty Tag */}
              <span className={`px-3 py-1 rounded-full font-medium ${
                difficulty === 'easy' ? 'bg-green-600 bg-opacity-50 text-white' :
                difficulty === 'medium' ? 'bg-yellow-600 bg-opacity-50 text-white' :
                'bg-red-600 bg-opacity-50 text-white'
              }`}>
                {difficulty === 'easy' ? 'Madali' : difficulty === 'medium' ? 'Katamtaman' : 'Mahirap'}
              </span>
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
        <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-purple-700">
          {currentQuestion && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Ayusin ang mga salita upang makabuo ng tamang pangungusap:</h2>
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="flex items-center px-4 py-2 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
                  >
                    {showTranslation ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showTranslation ? "Itago" : "Ipakita"} ang Translation
                  </button>
                </div>
                {showTranslation && (
                  <p className="text-purple-200 mt-2 bg-purple-800 bg-opacity-50 rounded-lg p-3">
                    Translation: {currentQuestion.translation}
                  </p>
                )}
              </div>

              {/* Constructed Sentence Area */}
              <div className="bg-purple-800 bg-opacity-50 rounded-2xl p-6 min-h-[100px] border border-purple-600">
                <div className="text-sm text-purple-200 mb-2 font-semibold">Pangungusap na Nabuo:</div>
                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {draggedFragments.map((fragment, index) => (
                    <button
                      key={index}
                      onClick={() => handleDraggedFragmentClick(fragment, index)}
                      className="px-4 py-3 bg-pink-400 text-white rounded-xl cursor-pointer transition-all duration-200 font-medium text-lg hover:bg-pink-300 hover:shadow-lg hover:scale-105 border-2 border-pink-300"
                    >
                      {fragment}
                    </button>
                  ))}
                  {draggedFragments.length === 0 && (
                    <div className="text-purple-300 italic text-lg flex items-center">I-click ang mga salita sa ibaba...</div>
                  )}
                </div>
              </div>

              {/* Available Fragments */}
              <div className="bg-purple-800 bg-opacity-50 rounded-2xl p-6 border border-purple-600">
                <div className="text-sm text-purple-200 mb-2 font-semibold">Mga Salitang Magagamit:</div>
                <div className="flex flex-wrap gap-2">
                  {availableFragments.map((fragment, index) => (
                    <button
                      key={index}
                      onClick={() => handleFragmentClick(fragment, index)}
                      className="px-4 py-3 bg-purple-200 text-purple-800 rounded-xl cursor-pointer transition-all duration-200 font-medium text-lg hover:bg-purple-300 hover:shadow-lg hover:scale-105 border-2 border-purple-300"
                    >
                      {fragment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div className={`text-center py-6 rounded-2xl mb-6 border-2 ${
                  lastAnswerCorrect
                    ? 'bg-green-600 bg-opacity-30 border-green-400 text-green-200'
                    : 'bg-red-600 bg-opacity-30 border-red-400 text-red-200'
                }`}>
                  <div className="text-2xl font-bold mb-2 flex items-center justify-center">
                    {lastAnswerCorrect ? <CheckCircle className="w-7 h-7 mr-2" /> : <XCircle className="w-7 h-7 mr-2" />}
                    {feedback}
                  </div>
                  {lastAnswerCorrect && (
                    <div className="text-yellow-300 font-semibold">
                      +10 puntos
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={resetFragments}
                  className="flex items-center px-6 py-3 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
                >
                  <RotateCcw className="w-5 h-5 mr-2" /> Reset
                </button>
                <button
                  onClick={checkAnswer}
                  disabled={draggedFragments.length === 0}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-green-800 hover:border-b-2 disabled:bg-purple-500 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-2"
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Sagot
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}