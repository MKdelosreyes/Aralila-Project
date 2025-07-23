'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Star, RotateCcw, Trophy, BookOpen, Eye, EyeOff, Clock, Zap, Heart, Target, Flame, Volume2, VolumeX, ArrowLeft, HelpCircle, Shuffle, Home } from 'lucide-react';

interface GameQuestion {
  id: number;
  images: string[];
  answer: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint: string;
}

// Sample questions data
const gameQuestions: GameQuestion[] = [
  {
    id: 1,
    images: [
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso2.jpg',
      '/images/imagesFor4Pics1Word/aso3.jpg',
      '/images/imagesFor4Pics1Word/aso4.jpg'
    ],
    answer: 'ASO',
    category: 'Animals',
    difficulty: 'Easy',
    hint: 'Mga nilalang na nabubuhay sa kalikasan'
  },
  {
    id: 2,
    images: [
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg'
    ],
    answer: 'KALIKASAN',
    category: 'Nature',
    difficulty: 'Easy',
    hint: 'Ang mundo na hindi ginawa ng tao'
  },
  {
    id: 3,
    images: [
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg'
    ],
    answer: 'PAGKAIN',
    category: 'Food',
    difficulty: 'Easy',
    hint: 'Kinakain natin araw-araw'
  },
  {
    id: 4,
    images: [
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg',
      '/images/imagesFor4Pics1Word/aso1.jpg'
    ],
    answer: 'BAHAY',
    category: 'Home',
    difficulty: 'Easy',
    hint: 'Dito tayo nakatira'
  },/*
  {
    id: 5,
    images: [
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop'
    ],
    answer: 'TEKNOLOHIYA',
    category: 'Technology',
    difficulty: 'Hard',
    hint: 'Mga bagay na tumutulong sa modernong buhay'
  },
  {
    id: 6,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'
    ],
    answer: 'KULAY',
    category: 'Colors',
    difficulty: 'Medium',
    hint: 'Nakikita natin sa paligid'
  }*/
];

export default function Filipino4Pics1WordGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
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
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [questionQueue, setQuestionQueue] = useState<GameQuestion[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [showDifficultySelection, setShowDifficultySelection] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showBackConfirmationModal, setShowBackConfirmationModal] = useState(false);
  const [showGameInfoModal, setShowGameInfoModal] = useState(false);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{letter: string, index: number}[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize question queue based on selected difficulty
  useEffect(() => {
    if (selectedDifficulty) {
      const filteredQuestions = gameQuestions.filter(q => q.difficulty === selectedDifficulty);
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setQuestionQueue(shuffled);
    } else {
      const shuffled = [...gameQuestions].sort(() => Math.random() - 0.5);
      setQuestionQueue(shuffled);
    }
  }, [selectedDifficulty]);

  const currentQ = questionQueue[currentQuestionIndex % questionQueue.length];

  // Generate available letters when question changes
  useEffect(() => {
    if (currentQ) {
      generateAvailableLetters();
      setCurrentGuess('');
      setSelectedLetters([]);
    }
  }, [currentQ]);

  const generateAvailableLetters = () => {
    if (!currentQ) return;
    
    const answer = currentQ.answer;
    const answerLetters = answer.split('');
    
    // Add some random letters to make it challenging
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = [];
    
    // Add 6-8 random letters
    for (let i = 0; i < 8; i++) {
      randomLetters.push(allLetters[Math.floor(Math.random() * allLetters.length)]);
    }
    
    // Combine answer letters with random letters and shuffle
    const combined = [...answerLetters, ...randomLetters];
    const shuffled = combined.sort(() => Math.random() - 0.5);
    
    setAvailableLetters(shuffled);
  };

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
  }, [gameStarted, gameComplete, timeLeft]);

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
    const filteredQuestions = gameQuestions.filter(q => q.difficulty === difficulty);
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
    setCurrentGuess('');
    setShowFeedback(false);
    setSelectedLetters([]);
  };

  const calculatePoints = (isCorrect: boolean, difficultyLevel: string, currentCombo: number) => {
    if (!isCorrect) return 0;

    let basePoints = 10;

    switch (difficultyLevel) {
      case 'Easy': basePoints = 15; break;
      case 'Medium': basePoints = 25; break;
      case 'Hard': basePoints = 40; break;
    }

    return Math.floor(basePoints * currentCombo);
  };

  const submitAnswer = () => {
    if (!currentQ || showFeedback) return;

    const isCorrect = currentGuess === currentQ.answer;

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
      setTimeLeft(prev => prev + 10);
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
      setFeedbackMessage(`Mali. Ang tamang sagot ay: ${currentQ.answer}`);
    }

    setQuestionsAnswered(prev => prev + 1);

    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setCurrentGuess('');
    setSelectedLetters([]);
    setShowFeedback(false);
    setFeedbackMessage('');

    if (questionQueue.length === 0 || (currentQuestionIndex + 1) % questionQueue.length === 0) {
      const filteredQuestions = gameQuestions.filter(q => q.difficulty === selectedDifficulty);
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setQuestionQueue(shuffled);
      setCurrentQuestionIndex(0);
    }
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (showFeedback || !gameStarted) return;

    // Add letter to guess
    const newSelectedLetters = [...selectedLetters, {letter, index}];
    setSelectedLetters(newSelectedLetters);
    setCurrentGuess(newSelectedLetters.map(sl => sl.letter).join(''));
  };

  const handleRemoveLetter = (indexToRemove: number) => {
    if (showFeedback || !gameStarted) return;

    const newSelectedLetters = selectedLetters.filter((_, index) => index !== indexToRemove);
    setSelectedLetters(newSelectedLetters);
    setCurrentGuess(newSelectedLetters.map(sl => sl.letter).join(''));
  };

  const handleShuffle = () => {
    if (showFeedback || !gameStarted) return;
    
    const shuffled = [...availableLetters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
  };

  const handleClearGuess = () => {
    if (showFeedback || !gameStarted) return;
    
    setSelectedLetters([]);
    setCurrentGuess('');
  };

  const handleHintClick = () => {
    if (totalPoints >= 2) {
      setTotalPoints(prev => prev - 2);
      setHintMessage(`Pahiwatig: ${currentQ?.hint || 'Walang pahiwatig'}`);
    } else {
      setHintMessage("Kailangan mo ng kahit 2 bituin para gumamit ng pahiwatig!");
    }
    setShowHintModal(true);
  };

  const handleSkipClick = () => {
    nextQuestion();
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setCurrentGuess('');
    setSelectedLetters([]);
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
    setShowGameInfoModal(false);

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
    setCurrentGuess('');
    setSelectedLetters([]);
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

  const goToMainMenu = () => {
    resetGame();
  };


  const handleGameInfoClick = () => {
    setShowGameInfoModal(true);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white opacity-10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-yellow-300 opacity-10 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-300 opacity-10 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Welcome Screen */}
      {!gameStarted && !showDifficultySelection && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <h1 className="text-4xl font-bold text-white mb-4">4 Larawan, 1 Salita</h1>
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
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="font-semibold text-green-300">Mga Larawan</p>
                    <p className="text-purple-200">Tignan ang 4 larawan at hulaan ang salita</p>
                  </div>
                  <div className="bg-purple-700 rounded-xl p-3 border border-purple-500 text-purple-100">
                    <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-300">Mga Letra</p>
                    <p className="text-purple-200">Piliin ang mga letra para makabuo ng sagot</p>
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
                  onClick={handleGameInfoClick}
                  className="p-3 bg-purple-700 text-purple-200 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
                  title="Paano Laruin?"
                >
                  <HelpCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Selection Screen */}
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
              <button
                onClick={resetGame}
                className="mt-6 px-6 py-2 bg-purple-700 text-purple-200 rounded-xl hover:bg-purple-600 transition-colors"
              >
                Bumalik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Started Screen - Placeholder */}
      {gameStarted && !gameComplete && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="bg-purple-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-purple-700">
              <h2 className="text-3xl font-bold text-white mb-6">Laro na!</h2>
              <p className="text-xl text-purple-200 mb-4">Naghihintay ng mga larawan...</p>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
              <p className="text-sm text-purple-300 mt-4">
                (Ito ay demo lamang - ang laro ay magtatapos pagkatapos ng 5 segundo)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
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

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setGameComplete(false);
                    setShowDifficultySelection(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-green-800 hover:border-b-2 flex items-center"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Maglaro Ulit
                </button>
                <button
                  onClick={goToMainMenu}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-800 hover:border-b-2 flex items-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Pangunahing Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};