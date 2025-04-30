import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingIndicator from "../LoadingIndicator";

const sampleWords = [
  { misspelled: "Saint", meaning: "Uri ng tela o damit" },
  { misspelled: "Kamusta", meaning: "Pagbati o pangungumusta" },
  { misspelled: "Librery", meaning: "Lugar kung saan may mga aklat" },
];

const SpellingGame = () => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);

  const currentWord = sampleWords[wordIndex];

  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver]);

  const handleSubmit = () => {
    const correct = correctSpelling(currentWord.misspelled);
    if (userInput.trim().toLowerCase() === correct.toLowerCase()) {
      setScore(score + 1);
      setTimeLeft(timeLeft + 3);
    }
    nextWord();
  };

  const handleSkip = () => {
    nextWord();
  };

  const nextWord = () => {
    if (wordIndex < sampleWords.length - 1) {
      setWordIndex(wordIndex + 1);
      setUserInput("");
    } else {
      setIsGameOver(true);
    }
  };

  const correctSpelling = (misspelled: String) => {
    switch (misspelled) {
      case "Satail":
        return "Satin";
      case "Kamusta":
        return "Kumusta";
      case "Librery":
        return "Library";
      default:
        return "";
    }
  };

  if (isGameOver) {
    const navigate = useNavigate();
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Game Over</h1>
        <p>Score: {score}</p>
        navigate()
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <p>⏳ {timeLeft}s</p>
        <p>⭐ Score: {score}</p>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {currentWord.misspelled}
        </h2>
        <p className="italic text-gray-600 mb-4">
          Kahulugan: {currentWord.meaning}
        </p>
        <input
          type="text"
          className="border p-2 w-full mb-4"
          placeholder="Ilagay ang tamang baybay"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <div className="flex justify-between 20px">
          <button
            onClick={handleSkip}
            className="bg-black px-4 py-2 text-white rounded"
          >
            Laktawan
          </button>
          <button
            onClick={handleSubmit}
            className="bg-black px-4 py-2 text-white rounded"
          >
            Suriin
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpellingGame;
