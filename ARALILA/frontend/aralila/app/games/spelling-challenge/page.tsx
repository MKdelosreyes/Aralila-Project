"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Star,
  Zap,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Play,
  BookOpen,
} from "lucide-react";

const SpellingChallenge = () => {
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameOver
  const [currentWord, setCurrentWord] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userLetters, setUserLetters] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");

  const wordSets = {
    easy: [
      {
        word: "FRIEND",
        definition: "A person you know well and like",
        hint: "Someone you like to spend time with",
      },
      {
        word: "BECAUSE",
        definition: "For the reason that",
        hint: "Used to give a reason for something",
      },
      {
        word: "BEAUTIFUL",
        definition: "Pleasing to look at; attractive",
        hint: "Something that looks very nice",
      },
      {
        word: "KNOWLEDGE",
        definition: "Information and understanding about a subject",
        hint: "What you learn from studying or experience",
      },
      {
        word: "NECESSARY",
        definition: "Required; needed",
        hint: "Something you must have or do",
      },
    ],
    medium: [
      {
        word: "RESTAURANT",
        definition: "A place where meals are served to customers",
        hint: "Where you go to eat food made by others",
      },
      {
        word: "DEFINITELY",
        definition: "Without doubt; certainly",
        hint: "Used to show you are completely sure",
      },
      {
        word: "ENVIRONMENT",
        definition: "The natural world around us",
        hint: "Nature and the world we live in",
      },
      {
        word: "EMBARRASS",
        definition: "To make someone feel awkward or ashamed",
        hint: "To make someone feel uncomfortable in public",
      },
      {
        word: "MEDITERRANEAN",
        definition: "Relating to the sea between Europe and Africa",
        hint: "A large sea surrounded by Europe, Africa, and Asia",
      },
    ],
    hard: [
      {
        word: "RHYTHM",
        definition: "A regular repeated pattern of sounds or beats",
        hint: "The beat in music or poetry",
      },
      {
        word: "PNEUMONIA",
        definition: "A serious illness affecting the lungs",
        hint: "A lung infection that makes breathing difficult",
      },
      {
        word: "CONSCIENCE",
        definition: "Your inner sense of right and wrong",
        hint: "The voice in your head about moral choices",
      },
      {
        word: "Wednesday",
        definition: "The day of the week between Tuesday and Thursday",
        hint: "The middle day of the work week",
      },
      {
        word: "MAINTENANCE",
        definition: "The process of keeping something in good condition",
        hint: "Taking care of something to keep it working well",
      },
    ],
  };

  const currentWords = wordSets[difficulty];
  const currentWordData = currentWords[currentWord];

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("gameOver");
    }
  }, [timeLeft, gameState]);

  const startGame = (selectedDifficulty = "easy") => {
    setDifficulty(selectedDifficulty);
    setGameState("playing");
    setCurrentWord(0);
    setTimeLeft(
      selectedDifficulty === "easy"
        ? 90
        : selectedDifficulty === "medium"
        ? 120
        : 150
    );
    setScore(0);
    setStreak(0);
    setUserLetters([]);
    setFeedback(null);
    setAnimationKey((prev) => prev + 1);
  };

  const updateLetter = (index, letter) => {
    const newLetters = [...userLetters];
    newLetters[index] = letter.toUpperCase();
    setUserLetters(newLetters);

    // Auto-focus next input
    if (letter && index < currentWordData.word.length - 1) {
      setTimeout(() => {
        const nextInput = document.getElementById(`letter-${index + 1}`);
        if (nextInput) nextInput.focus();
      }, 10);
    }
  };

  const submitAnswer = () => {
    const userWord = userLetters.join("");
    const correctWord = currentWordData.word;

    if (userWord === correctWord) {
      // Correct answer - add bonus time
      const bonusTime =
        difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;
      setTimeLeft((prev) =>
        Math.min(
          prev + bonusTime,
          difficulty === "easy" ? 90 : difficulty === "medium" ? 120 : 150
        )
      );

      const basePoints =
        difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30;
      const points = streak >= 3 ? basePoints * 2 : basePoints;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setFeedback({
        type: "success",
        message: `Correct! +${points} points +${bonusTime} seconds`,
      });

      setTimeout(() => {
        if (currentWord < currentWords.length - 1) {
          setCurrentWord((prev) => prev + 1);
          setUserLetters([]);
          setFeedback(null);
          setAnimationKey((prev) => prev + 1);
        } else {
          setGameState("gameOver");
        }
      }, 2000);
    } else {
      // Wrong answer
      setStreak(0);
      setFeedback({
        type: "error",
        message: `Incorrect. The answer is "${correctWord}"`,
      });
      setTimeout(() => {
        setUserLetters([]);
        setFeedback(null);
      }, 3000);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      if (
        index === currentWordData.word.length - 1 &&
        userLetters.filter((l) => l).length === currentWordData.word.length
      ) {
        submitAnswer();
      }
    } else if (e.key === "Backspace" && !userLetters[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.getElementById(`letter-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-purple-400";
    }
  };

  const getDifficultyBg = (diff) => {
    switch (diff) {
      case "easy":
        return "bg-green-500/20 border-green-400/50";
      case "medium":
        return "bg-yellow-500/20 border-yellow-400/50";
      case "hard":
        return "bg-red-500/20 border-red-400/50";
      default:
        return "bg-purple-500/20 border-purple-400/50";
    }
  };

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Word Spelling
            </h1>
            <p className="text-purple-200">
              Type each letter to spell the word correctly!
            </p>
          </div>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-center gap-3 text-purple-100">
              <Clock className="w-5 h-5 text-purple-300" />
              <span>Generous time limits for each difficulty</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100">
              <Star className="w-5 h-5 text-purple-300" />
              <span>Learn definitions and build vocabulary</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100">
              <Trophy className="w-5 h-5 text-purple-300" />
              <span>Bonus time for correct answers</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-white font-semibold">Choose Difficulty:</h3>
            <button
              onClick={() => startGame("easy")}
              className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-100 font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex justify-between items-center">
                <span>Easy</span>
                <span className="text-sm">90s • 5 words</span>
              </div>
            </button>
            <button
              onClick={() => startGame("medium")}
              className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 text-yellow-100 font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex justify-between items-center">
                <span>Medium</span>
                <span className="text-sm">120s • 5 words</span>
              </div>
            </button>
            <button
              onClick={() => startGame("hard")}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex justify-between items-center">
                <span>Hard</span>
                <span className="text-sm">150s • 5 words</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Game Complete!
            </h1>
            <p className="text-purple-200">
              Well done on the {difficulty} challenge!
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">{score}</div>
              <div className="text-purple-200">Final Score</div>
            </div>
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {currentWord + 1}/{currentWords.length}
              </div>
              <div className="text-purple-200">Words Completed</div>
            </div>
            <div
              className={`backdrop-blur-sm rounded-2xl p-4 border ${getDifficultyBg(
                difficulty
              )}`}
            >
              <div
                className={`text-xl font-bold ${getDifficultyColor(
                  difficulty
                )} mb-1 capitalize`}
              >
                {difficulty}
              </div>
              <div className="text-purple-200">Difficulty Level</div>
            </div>
          </div>

          <button
            onClick={() => setGameState("menu")}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const maxTime =
    difficulty === "easy" ? 90 : difficulty === "medium" ? 120 : 150;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-300" />
                <span
                  className={`text-2xl font-bold ${
                    timeLeft <= 15 ? "text-red-400" : "text-white"
                  }`}
                >
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{score}</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="text-lg font-bold text-orange-400">
                    {streak}x
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold capitalize backdrop-blur-sm border ${getDifficultyBg(
                  difficulty
                )} ${getDifficultyColor(difficulty)}`}
              >
                {difficulty}
              </div>
              <div className="text-purple-200">
                {currentWord + 1} / {currentWords.length}
              </div>
            </div>
          </div>

          {/* Timer Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                timeLeft <= 15
                  ? "bg-gradient-to-r from-red-500 to-red-400"
                  : "bg-gradient-to-r from-purple-400 to-pink-400"
              }`}
              style={{
                width: `${(timeLeft / maxTime) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-purple-200 mt-1">
            <span>Time Remaining</span>
            <span>{Math.round((timeLeft / maxTime) * 100)}%</span>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div
            key={animationKey}
            className="animate-in slide-in-from-left duration-500"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Spell this word:
              </h2>
              <div className="text-lg text-purple-200 mb-6">
                {currentWordData.hint}
              </div>

              {/* Letter Input Boxes */}
              <div className="flex justify-center gap-3 mb-8 flex-wrap">
                {currentWordData.word.split("").map((letter, index) => (
                  <input
                    key={index}
                    id={`letter-${index}`}
                    type="text"
                    maxLength="1"
                    value={userLetters[index] || ""}
                    onChange={(e) => updateLetter(index, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, index)}
                    className="w-16 h-16 text-3xl font-bold text-center rounded-2xl bg-white/10 border-2 border-white/20 text-white focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 backdrop-blur-sm transition-all duration-300"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                onClick={submitAnswer}
                disabled={
                  userLetters.filter((l) => l).length !==
                  currentWordData.word.length
                }
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed text-lg"
              >
                Submit Word
              </button>
            </div>
          </div>

          {/* Definition */}
          <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 mt-8">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Definition:
                </h3>
                <p className="text-purple-100 text-lg leading-relaxed">
                  {currentWordData.definition}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-6 p-4 rounded-2xl backdrop-blur-sm border animate-in slide-in-from-bottom duration-300 ${
                feedback.type === "success"
                  ? "bg-green-500/20 border-green-400/50 text-green-100"
                  : "bg-red-500/20 border-red-400/50 text-red-100"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === "success" && (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {feedback.type === "error" && <XCircle className="w-5 h-5" />}
                <span className="font-semibold text-lg">
                  {feedback.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellingChallenge;
