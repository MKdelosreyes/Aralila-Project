'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Star, RotateCcw, Trophy, BookOpen, Eye, EyeOff, Clock, Zap, Heart, Target, Flame, Volume2, VolumeX, ArrowLeft, HelpCircle } from 'lucide-react';
import { grammarAccuracyQuestions } from '@/data/GrammarAccuracyData';

interface GrammarError {
  word: string;
  errorType: string;
  explanation: string;
  correct: string;
}

interface Question {
  id: number;
  sentence: string;
  errors: GrammarError[];
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}


export default function FilipinoGrammarGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [autoSubmitTimer, setAutoSubmitTimer] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [showDifficultySelection, setShowDifficultySelection] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showBackConfirmationModal, setShowBackConfirmationModal] = useState(false);
  const [showGrammarLessonModal, setShowGrammarLessonModal] = useState(false); // New state for grammar lesson modal

  const audioRef = useRef<HTMLAudioElement>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize question queue based on selected difficulty
  useEffect(() => {
    if (selectedDifficulty) {
      const filteredQuestions = grammarAccuracyQuestions.filter(q => q.difficulty === selectedDifficulty);
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setQuestionQueue(shuffled);
    } else {
      const shuffled = [...grammarAccuracyQuestions].sort(() => Math.random() - 0.5);
      setQuestionQueue(shuffled);
    }
  }, [selectedDifficulty]);

  const currentQ = questionQueue[currentQuestionIndex % questionQueue.length];

  // Main game timer
  useEffect(() => {
    let timer: number;

    if (gameStarted && !gameComplete && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameComplete) {
      if (gameOverSoundRef.current) {
        console.log("Playing game over sound due to time or lives.");
        gameOverSoundRef.current.play().catch(e => console.error("Error playing game over sound:", e));
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameComplete]);

  // Auto-submit timer when user makes selections
  useEffect(() => {
    if (selectedErrors.length > 0 && gameStarted && !gameComplete) {
      if (autoSubmitTimer) clearTimeout(autoSubmitTimer);

      const timer = setTimeout(() => {
        submitAnswer();
      }, 2500);

      setAutoSubmitTimer(timer);
    }

    return () => {
      if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
    };
  }, [selectedErrors, gameStarted, gameComplete]);

  // Handle background music playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !gameComplete) {
        audioRef.current.play().catch(e => console.error("Error playing background audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, gameComplete]);

  const handleStartGameClick = () => {
    setShowDifficultySelection(true);
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Error playing background audio on start game click:", e));
    }
  };

  const startGame = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setSelectedDifficulty(difficulty);
    const filteredQuestions = grammarAccuracyQuestions.filter(q => q.difficulty === difficulty);
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setQuestionQueue(shuffled);

    setGameStarted(true);
    setShowDifficultySelection(false);
    setTimeLeft(60);
    setLives(3);
    setStreak(0);
    setCombo(1);
    setTotalPoints(0);
    setQuestionsAnswered(0);
    setCurrentQuestionIndex(0);
    setSelectedErrors([]);
    setShowFeedback(false);
  };

  const calculatePoints = (isCorrect: boolean, difficultyLevel: string, currentCombo: number) => {
    if (!isCorrect) return 0;

    let basePoints = 10;

    switch (difficultyLevel) {
      case 'Easy': basePoints = 10; break;
      case 'Medium': basePoints = 20; break;
      case 'Hard': basePoints = 30; break;
    }

    return Math.floor(basePoints * currentCombo);
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 10) return "🔥 HINDI MAPIGILAN! 🔥";
    if (streak >= 7) return "⚡ NAGLALAGABLAB! ⚡";
    if (streak >= 5) return "🚀 KAGILA-GILALAS! 🚀";
    if (streak >= 3) return "✨ MAHUSAY! ✨";
    if (streak >= 2) return "👍 MAGANDA! 👍";
    return "🎯 TAMA! 🎯";
  };

  const submitAnswer = () => {
    if (!currentQ || showFeedback) return;

    const correctErrors = currentQ.errors.map(error => error.word);
    const selectedWords = selectedErrors.map(error => error.split('-')[0]);

    let isCorrect = false;

    if (currentQ.errors.length === 0) {
      isCorrect = selectedErrors.length === 0;
    } else {
      isCorrect = correctErrors.length === selectedWords.length &&
                   correctErrors.every(error => selectedWords.includes(error));
    }

    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      const newStreak = streak + 1;
      const newCombo = Math.min(5, Math.floor(newStreak / 3) + 1);
      const points = calculatePoints(true, currentQ.difficulty, combo);

      setStreak(newStreak);
      setCombo(newCombo);
      setTotalPoints(prev => prev + points);
      setFeedbackMessage("Tama! Ipagpatuloy!");
      setTimeLeft(prev => prev + 5);
    } else {
      setStreak(0);
      setCombo(1);
      setLives(prev => {
        const newLives = Math.max(0, prev - 1);
        if (newLives <= 0) {
          setGameComplete(true);
          console.log("Playing game over sound due to lives running out.");
          if (gameOverSoundRef.current) {
            gameOverSoundRef.current.play().catch(e => console.error("Error playing game over sound:", e));
          }
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
        return newLives;
      });
      setFeedbackMessage("Mali. Subukang muli!");
    }

    setQuestionsAnswered(prev => prev + 1);

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    if (autoSubmitTimer) clearTimeout(autoSubmitTimer);

    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedErrors([]);
    setShowFeedback(false);
    setFeedbackMessage('');

    if (questionQueue.length === 0 || (currentQuestionIndex + 1) % questionQueue.length === 0) {
      const filteredQuestions = grammarAccuracyQuestions.filter(q => q.difficulty === selectedDifficulty);
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setQuestionQueue(shuffled);
      setCurrentQuestionIndex(0);
    }
  };

  const handleWordClick = (word: string, index: number) => {
    if (showFeedback || !gameStarted) return;

    const wordKey = `${word}-${index}`;
    if (selectedErrors.includes(wordKey)) {
      setSelectedErrors(selectedErrors.filter(error => error !== wordKey));
    } else {
      setSelectedErrors([...selectedErrors, wordKey]);
    }
  };

  const handleHintClick = () => {
    if (totalPoints >= 1) {
      setTotalPoints(prev => prev - 1);
      if (currentQ.errors.length > 0) {
        const firstError = currentQ.errors[0];
        setHintMessage(`Pahiwatig: Ang mali ay nasa salitang '${firstError.word}'. Paliwanag: ${firstError.explanation}`);
      } else {
        setHintMessage("Pahiwatig: Walang mali sa pangungusap na ito!");
      }
    } else {
      setHintMessage("Kailangan mo ng kahit 1 bituin para gumamit ng pahiwatig!");
    }
    setShowHintModal(true);
  };

  const handleNoErrorsClick = () => {
    setSelectedErrors([]);
    submitAnswer();
  };

  const handleSkipClick = () => {
    nextQuestion();
  };

  const resetGame = () => {
    if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
    setCurrentQuestionIndex(0);
    setSelectedErrors([]);
    setTotalPoints(0);
    setGameComplete(false);
    setGameStarted(false);
    setTimeLeft(60);
    setLives(3);
    setStreak(0);
    setCombo(1);
    setQuestionsAnswered(0);
    setShowFeedback(false);
    setFeedbackMessage('');
    setSelectedDifficulty(null);
    setShowDifficultySelection(false);
    setShowHintModal(false);
    setShowBackConfirmationModal(false);
    setShowGrammarLessonModal(false); // Close grammar lesson modal on reset

    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.pause();
      gameOverSoundRef.current.currentTime = 0;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Error playing background audio:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleBackButtonClick = () => {
    setShowBackConfirmationModal(true);
  };

  const handleResumeGameOption = () => {
    setShowBackConfirmationModal(false);
  };

  const handleRestartGameOption = () => {
    setCurrentQuestionIndex(0);
    setSelectedErrors([]);
    setTotalPoints(0);
    setGameComplete(false);
    setGameStarted(true);
    setTimeLeft(60);
    setLives(3);
    setStreak(0);
    setCombo(1);
    setQuestionsAnswered(0);
    setShowFeedback(false);
    setFeedbackMessage('');
    setSelectedDifficulty(null);
    setShowDifficultySelection(true);

    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.pause();
      gameOverSoundRef.current.currentTime = 0;
    }
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.error("Error resuming background audio on restart option:", e));
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setShowBackConfirmationModal(false);
  };

  const handleQuitGameOption = () => {
    resetGame();
  };

  const handleGrammarLessonClick = () => {
    setShowGrammarLessonModal(true);
  };


  const renderSentence = () => {
    if (!currentQ) return null;

    const tokens = currentQ.sentence.match(/(\w+'?\w*|[.,!?;:"'])/g) || [];

    return tokens.map((token, index) => {
      const wordKey = `${token}-${index}`;
      const isSelected = selectedErrors.includes(wordKey);
      const isError = currentQ.errors.some(error => error.word === token);
      const showCorrection = showFeedback && isError;

      const needsSpace = index < tokens.length - 1;

      return (
        <React.Fragment key={index}>
          <button
            onClick={() => handleWordClick(token, index)}
            className={`
              inline-block mx-1 my-1 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium text-lg
              ${isSelected
                ? 'bg-pink-400 text-white shadow-lg transform scale-105 border-2 border-pink-300'
                : 'bg-purple-200 text-purple-800 hover:bg-purple-300 hover:shadow-lg hover:scale-105 border-2 border-purple-300'
              }
              ${showFeedback && isError
                ? 'bg-red-400 text-white border-red-300'
                : ''
              }
            `}
          >
            {showCorrection ? (
              <span className="relative">
                <span className="line-through opacity-75">{token}</span>
                <span className="ml-2 text-green-300 font-bold">
                  {currentQ.errors.find(e => e.word === token)?.correct || '✓'}
                </span>
              </span>
            ) : (
              token
            )}
          </button>
          {needsSpace && ' '}
        </React.Fragment>
      );
    });
  };

  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-400';
    if (timeLeft > 10) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((60 - timeLeft) / 60) * 100;
  };

  const reason = lives <= 0 ? 'Wala Nang Buhay!' : 'Tapos Na ang Oras!';
  const reasonIcon = lives <= 0 ? '💔' : '⏰';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 p-4">
      {/* Background Music Audio Element */}
      <audio ref={audioRef} loop>
        {/* Changed background music to a more chill track */}
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Sound Effect Audio Elements */}
      <audio ref={gameOverSoundRef}>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" type="audio/mpeg" />
      </audio>

      {/* Control Buttons (Back and Music Toggle) */}
      <div className="fixed top-4 left-4 flex items-center space-x-4 z-50">
        {gameStarted && !gameComplete && ( // Only show back button during active game
          <button
            onClick={handleBackButtonClick}
            className="p-3 bg-purple-700 text-purple-200 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
            title="Bumalik sa Menu"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      <button
        onClick={toggleMusic}
        className="fixed top-4 right-4 p-3 bg-purple-700 text-purple-200 rounded-full shadow-lg hover:bg-purple-600 transition-colors z-50"
        title={isPlaying ? "I-pause ang Musika" : "I-play ang Musika"}
      >
        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>

      {/* Conditional Rendering for Game Screens */}
      {!gameStarted && !showDifficultySelection && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <div className="flex items-center justify-center mb-6">
                {/* <Flame className="w-12 h-12 text-orange-400 mr-3" />
                <BookOpen className="w-12 h-12 text-purple-300" /> CAN ADD LOGO INSTEAD
                <Target className="w-12 h-12 text-green-400 ml-3" /> */}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Gramatika</h1>
              <div className="bg-purple-800 rounded-2xl p-6 mb-6 border border-purple-600">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-purple-300 mr-3" />
                  <p className="text-2xl font-semibold text-purple-100">60-Segundong Hamon!</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="font-semibold text-red-300">3 Buhay</p>
                    <p className="text-purple-200">Mawawalan ng isa sa bawat maling sagot</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="font-semibold text-orange-300">Sistema ng Combo</p>
                    <p className="text-purple-200">Bumuo ng sunod-sunod para sa mas maraming puntos</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-300">Awtomatikong Pagsumite</p>
                    <p className="text-purple-200">2.5 segundo pagkatapos ng pagpili</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="font-semibold text-green-300">Walang Tigil na Aksyon</p>
                    <p className="text-purple-200">Tuloy-tuloy ang mga tanong!</p>
                  </div>
                </div>
                <div className="bg-purple-700 rounded-xl p-4 border border-purple-500">
                  <p className="font-bold text-purple-100 mb-2">MGA MULTIPLIER NG COMBO:</p>
                  <p className="text-sm text-purple-200">
                    3+ sunod-sunod = 2x • 6+ sunod-sunod = 3x • 9+ sunod-sunod = 4x • 12+ sunod-sunod = 5x MAX!
                  </p>
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
                  onClick={handleGrammarLessonClick}
                  className="p-3 bg-purple-700 text-purple-200 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
                  title="Ano ang Gramatika?"
                >
                  <HelpCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDifficultySelection && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <h2 className="text-3xl font-bold text-white mb-6">Piliin ang Antas ng Hamon:</h2>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => startGame('Easy')}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-green-800 hover:border-b-2"
                >
                   Madali
                </button>
                <button
                  onClick={() => startGame('Medium')}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xl font-bold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-yellow-800 hover:border-b-2"
                >
                   Katamtaman
                </button>
                <button
                  onClick={() => startGame('Hard')}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xl font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-red-800 hover:border-b-2"
                >
                   Mahirap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameComplete && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <div className="text-6xl mb-4 text-white">{reasonIcon}</div>
              <h1 className="text-4xl font-bold text-white mb-2">Tapos Na ang Laro!</h1>
              <p className="text-xl text-purple-200 mb-6">{reason}</p>

              <div className="bg-purple-800 rounded-2xl p-6 mb-6 border border-purple-600">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-purple-700 rounded-xl p-4 border border-purple-500 text-purple-100">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-purple-200">Huling Puntos</p>
                    <p className="text-4xl font-bold text-yellow-400">{totalPoints}</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-4 border border-purple-500 text-purple-100">
                    <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-purple-200">Mga Tanong</p>
                    <p className="text-4xl font-bold text-green-400">{questionsAnswered}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-700 rounded-xl p-4 border border-purple-500 text-purple-100">
                    <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-purple-200">Pinakamahusay na Sunod-sunod</p>
                    <p className="text-3xl font-bold text-orange-400">{Math.max(streak, 0)}</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-4 border border-purple-500 text-purple-100">
                    <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-purple-200">Natitirang Buhay</p>
                    <p className="text-3xl font-bold text-red-400">{lives}</p>
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
      )}

      {gameStarted && !gameComplete && (
        <div className="max-w-4xl mx-auto">
          {/* Header with stats */}
          <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl p-6 mb-6 border border-purple-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-purple-300 mr-2" />
                  <span className="text-2xl font-bold text-white">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 mr-2" />
                  <span className="text-2xl font-bold text-yellow-400">{totalPoints}</span>
                </div>
                <div className="flex items-center">
                  <Flame className="w-6 h-6 text-orange-400 mr-2" />
                  <span className="text-2xl font-bold text-orange-400">{combo}x</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Difficulty Tag */}
                {selectedDifficulty && (
                  <span className={`px-3 py-1 rounded-full font-medium ${
                    selectedDifficulty === 'Easy' ? 'bg-green-600 bg-opacity-50 text-white' :
                    selectedDifficulty === 'Medium' ? 'bg-yellow-600 bg-opacity-50 text-white' :
                    'bg-red-600 bg-opacity-50 text-white'
                  }`}>
                    {selectedDifficulty}
                  </span>
                )}
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

            {/* Progress bar */}
            <div className="w-full bg-purple-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Main game card */}
          <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-purple-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Hanapin ang mga pagkakamali sa gramatika:</h2>
            </div>

            <div className="bg-purple-800 bg-opacity-50 rounded-2xl p-6 mb-6 border border-purple-600">
              <div className="text-center leading-relaxed">
                {renderSentence()}
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
                  {feedbackMessage}
                </div>
                {lastAnswerCorrect && (
                  <div className="text-yellow-300 font-semibold">
                    +{calculatePoints(true, currentQ?.difficulty || 'Easy', combo)} puntos
                  </div>
                )}
              </div>
            )}

            {/* Auto-submit indicator */}
            {selectedErrors.length > 0 && !showFeedback && (
              <div className="text-center text-purple-200 font-medium mb-4">
                Awtomatikong isinusumite...
              </div>
            )}

            {/* No Error, Hint and Skip Buttons */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleNoErrorsClick}
                className="flex items-center px-6 py-3 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
              >
                <CheckCircle className="w-5 h-5 mr-2" /> Walang Mali
              </button>
              <button
                onClick={handleHintClick}
                className="flex items-center px-6 py-3 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
              >
                <Eye className="w-5 h-5 mr-2" /> Pahiwatig (-1 ⭐)
              </button>
              <button
                onClick={handleSkipClick}
                className="flex items-center px-6 py-3 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors shadow-md border border-purple-500"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Laktawan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-purple-700 max-w-sm w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Pahiwatig!</h3>
            <p className="text-purple-200 mb-6">{hintMessage}</p>
            <button
              onClick={() => setShowHintModal(false)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-900 hover:border-b-2"
            >
              Nakuha Ko!
            </button>
          </div>
        </div>
      )}

      {/* Back Confirmation Modal */}
      {showBackConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-purple-700 max-w-sm w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Sigurado ka ba?</h3>
            <p className="text-purple-200 mb-6">Ano ang gusto mong gawin?</p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleResumeGameOption}
                className="px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg border-b-4 border-green-800"
              >
                Ipagpatuloy ang Laro
              </button>
              <button
                onClick={handleRestartGameOption}
                className="px-6 py-3 bg-yellow-600 text-white text-lg font-bold rounded-xl hover:bg-yellow-700 transition-colors shadow-lg border-b-4 border-yellow-800"
              >
                I-restart ang Laro
              </button>
              <button
                onClick={handleQuitGameOption}
                className="px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg border-b-4 border-red-800"
              >
                Umalis sa Laro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Lesson Modal */}
      {showGrammarLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-purple-700 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Ano ang Gramatika?</h3>
            <p className="text-purple-200 mb-4 text-justify">
              Ang gramatika ay ang sistema o hanay ng mga alituntunin na namamahala sa istruktura ng isang wika. Ito ang nagtatakda kung paano nabubuo ang mga salita, parirala, sugnay, at pangungusap upang magkaroon ng malinaw at tamang kahulugan.
            </p>
            <h3 className="text-2xl font-bold text-white mb-4">Bakit Mahalaga Itong Matutunan?</h3>
            <p className="text-purple-200 mb-6 text-justify">
              Mahalaga ang gramatika dahil ito ang pundasyon ng epektibong komunikasyon. Sa pamamagitan ng tamang paggamit ng gramatika, mas malinaw nating naipapahayag ang ating mga ideya at naiintindihan ang mensahe ng iba. Nakakatulong din ito upang maging mas propesyonal at kapani-paniwala sa pagsusulat at pagsasalita.
            </p>
            <button
              onClick={() => setShowGrammarLessonModal(false)}
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