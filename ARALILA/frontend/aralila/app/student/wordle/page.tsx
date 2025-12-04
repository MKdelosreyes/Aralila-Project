"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AnimatedBackground from "@/components/bg/animatedforest-bg";

// --- DATA: 5-Letter Filipino Word List ---
const WORDS = [
  "ABACA", "AGILA", "AKLAT", "ALALA", "ALINE", "AMBAG", "ANINO", "ARARO", "ASIN", "ATAKE",
  "ATRAS", "BABAE", "BAGAY", "BAGYO", "BAHAY", "BAKA", "BAKAL", "BALAT", "BALIK", "BALIT",
  "BANIG", "BANSA", "BARKO", "BASAG", "BATAS", "BATAY", "BATO", "BAYAD", "BAYAN", "BESES",
  "BIGAS", "BIGAT", "BIGLA", "BILAN", "BILIS", "BINHI", "BISIG", "BITUIN", "BUHAY", "BUKAS",
  "BUKID", "BULAK", "BULAG", "BUNGA", "BUWAN", "DAGAT", "DAHIL", "DAHON", "DALOY", "DAMIT",
  "DAPAT", "DATI", "DILIM", "DINGDING", "DIYOS", "DUGO", "GABAY", "GALIT", "GAMIT", "GAMOT",
  "GANDA", "GUSTO", "HAGDAN", "HANGIN", "HAPON", "HIRAP", "HULI", "IBON", "ILOG", "INIT",
  "ISIP", "ITLOG", "KAIN", "KALULUWA", "KAMAY", "KANAN", "KAPAL", "KASAMA", "KILAY", "KILOS",
  "KITA", "KULAY", "KUWENTO", "LABAN", "LABAS", "LAKAD", "LAKAS", "LALIM", "LAMIG", "LANGIT",
  "LARO", "LASA", "LAHAT", "LAHI", "LEEG", "LIBRO", "LIGAYA", "LIHAM", "LIHIM", "LIKHA",
  "LIPAD", "LUPA", "MAHAL", "MALAY", "MATA", "MUKHA", "MUNDO", "NGITI", "NOO", "ORAS",
  "PAA", "PALAD", "PANALO", "PANAHON", "PASOK", "PATO", "PERA", "PILI", "PINTU", "PITO",
  "PUNO", "PUSO", "PUTI", "SABI", "SAKIT", "SALITA", "SAMA", "SAYAW", "SIKAT", "SILID",
  "SIMULA", "SINTA", "SIRIT", "SUGAT", "SULAT", "SUNDO", "SWERTE", "TAO", "TAMA", "TAWA",
  "TAYO", "TIIG", "TUBIG", "TULONG", "TUNOG", "TUWA", "ULAN", "ULO", "UNA", "USAP",
  "WAKAS", "WALA", "WALO", "YAMAN", "YELO"
].filter(w => w.length === 5); // Ensure strict 5-letter compliance

// --- CONSTANTS ---
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

// --- HELPER FUNCTIONS ---
const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

export default function FilipinoWordle() {
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [shakeRow, setShakeRow] = useState(false);

  // Initialize game
  useEffect(() => {
    setSolution(getRandomWord());
  }, []);

  // Handle Input
  const handleKey = useCallback((key: string) => {
    if (isGameOver) return;

    if (key === "ENTER") {
      if (currentGuess.length !== WORD_LENGTH) {
        showMessage("Kulang sa letra! (Not enough letters)");
        triggerShake();
        return;
      }
      if (!WORDS.includes(currentGuess)) {
        showMessage("Wala sa listahan! (Word not found)");
        triggerShake();
        return;
      }
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (currentGuess === solution) {
        setIsGameOver(true);
        showMessage("Panalo! (You Won!)");
      } else if (newGuesses.length >= MAX_GUESSES) {
        setIsGameOver(true);
        showMessage(`Talo! Ang salita ay ${solution}`);
      }
    } else if (key === "DEL" || key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else {
      if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
        setCurrentGuess((prev) => prev + key);
      }
    }
  }, [currentGuess, guesses, isGameOver, solution]);

  // Physical Keyboard Listener
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
        handleKey(key === "BACKSPACE" ? "DEL" : key);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleKey]);

  // UI Helpers
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const triggerShake = () => {
    setShakeRow(true);
    setTimeout(() => setShakeRow(false), 500);
  };

  // Logic to determine tile colors
  const getTileStatus = (word: string, index: number, target: string) => {
    const letter = word[index];
    if (!letter) return "empty";

    if (target[index] === letter) return "correct";
    if (!target.includes(letter)) return "absent";

    // Handle duplicate letters logic (Yellow vs Gray)
    const letterCountInTarget = target.split("").filter((l) => l === letter).length;
    const correctPlacements = word
      .split("")
      .filter((l, i) => l === letter && target[i] === l).length;
    
    // Letters to the left of current index that are the same letter
    const previousOccurrences = word
      .substring(0, index)
      .split("")
      .filter((l) => l === letter).length;

    // Determine if we have "used up" the available yellows/greens for this letter
    if (previousOccurrences + correctPlacements < letterCountInTarget) {
      return "present";
    }
    return "absent";
  };

  // Logic for keyboard colors
  const getKeyStatus = (key: string) => {
    let status = "default";
    // Check all previous guesses
    guesses.forEach((guess) => {
      // If we found it green before, it stays green
      if (status === "correct") return;

      const idx = guess.indexOf(key);
      if (idx === -1) return;

      // Check specific placement logic simplified for keyboard
      const exactMatch = guess.split("").some((l, i) => l === key && solution[i] === key);
      if (exactMatch) {
        status = "correct";
        return;
      }
      
      if (solution.includes(key) && status !== "correct") {
        status = "present";
      } else if (!solution.includes(key)) {
        status = "absent";
      }
    });
    return status;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-4 font-sans select-none overflow-hidden relative">
      
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <AnimatedBackground />
      </div>

      <header className="z-10 mb-2 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          SALITAAN
        </h1>
        <p className="text-xs text-purple-200 uppercase tracking-widest opacity-70">Filipino Wordle</p>
      </header>

      {/* Message Toast */}
      <div className="h-8 mb-2 z-20">
        {message && (
          <div className="bg-slate-100 text-slate-900 px-4 py-1 rounded font-bold text-sm animate-bounce shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            {message}
          </div>
        )}
      </div>

      {/* Game Grid */}
      <div className="z-10 flex flex-col gap-2 mb-6">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = isCurrentRow ? currentGuess : (guesses[rowIndex] || "");
          const isSubmitted = rowIndex < guesses.length;

          return (
            <div
              key={rowIndex}
              className={`flex gap-2 ${isCurrentRow && shakeRow ? "animate-shake" : ""}`}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const letter = guess[colIndex] || "";
                const status = isSubmitted ? getTileStatus(guess, colIndex, solution) : "empty";
                
                // Animation delay for reveal
                const delay = isSubmitted ? `${colIndex * 150}ms` : "0ms";

                // Defining the glass styles based on state
                let cellClass = "border-2 border-white/10 bg-white/5"; // Default empty glass

                if (letter && !isSubmitted) {
                    // Typing state glass
                    cellClass = "border-2 border-purple-400/60 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-105";
                }
                
                // Submitted states (translucent colors)
                if (status === "correct") cellClass = "bg-green-600/90 border-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
                if (status === "present") cellClass = "bg-yellow-600/90 border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
                if (status === "absent") cellClass = "bg-slate-800/80 border-slate-700/60 opacity-70";

                return (
                  <div
                    key={colIndex}
                    style={{ transitionDelay: delay }}
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center 
                      text-2xl font-bold uppercase transition-all duration-500 transform
                      rounded-xl
                      backdrop-blur-md
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.1)]
                      ${isSubmitted ? "rotate-x-0" : ""}
                      ${cellClass}
                    `}
                  >
                    {isSubmitted ? (
                      <div className="animate-flipIn" style={{ animationDelay: delay }}>{letter}</div>
                    ) : (
                      letter
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Instructions (Compact) */}
      <div className="z-10 w-full max-w-md px-4 mb-4 text-center">
        <details className="cursor-pointer group">
          <summary className="text-sm font-bold text-purple-300 hover:text-purple-100 transition-colors list-none">
            <span className="border-b border-purple-500/50 pb-1">HOW TO PLAY (PAANO MAGLARO)</span>
          </summary>
          <div className="mt-4 text-xs sm:text-sm text-slate-300 bg-slate-800/80 p-4 rounded-lg border border-slate-700 backdrop-blur-md shadow-lg">
            <p className="mb-2">Guess the WORDLE in six tries. Each guess must be a valid five-letter Filipino word.</p>
            <div className="flex flex-col gap-2 mt-3 text-left">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 border border-green-500 flex items-center justify-center font-bold text-xs rounded">W</span>
                <span><strong className="text-green-400">Correct</strong> spot (Tamang pwesto).</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-600 border border-yellow-500 flex items-center justify-center font-bold text-xs rounded">I</span>
                <span><strong className="text-yellow-400">Wrong</strong> spot (Maling pwesto).</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-600 border border-slate-500 flex items-center justify-center font-bold text-xs rounded">U</span>
                <span><strong className="text-slate-400">Not</strong> in word (Wala sa salita).</span>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Virtual Keyboard */}
      <div className="z-10 w-full max-w-lg px-2 flex flex-col gap-2 mt-auto mb-4">
        {KEYBOARD_LAYOUT.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const status = getKeyStatus(key);
              let keyClass = "bg-slate-700 text-white hover:bg-slate-600";
              if (status === "correct") keyClass = "bg-green-600 hover:bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
              if (status === "present") keyClass = "bg-yellow-600 hover:bg-yellow-500 border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)]";
              if (status === "absent") keyClass = "bg-slate-800 text-slate-500 border-slate-800";

              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`
                    ${key.length > 1 ? "px-2 sm:px-4 text-xs" : "w-8 sm:w-10 text-lg"}
                    h-12 sm:h-14 font-bold rounded cursor-pointer transition-all duration-150
                    active:scale-95 border-b-4 border-slate-900/50
                    ${keyClass}
                  `}
                >
                  {key === "DEL" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Styles for Custom Animations */}
      <style jsx global>{`
        @keyframes flipIn {
          0% { transform: rotateX(-90deg); opacity: 0; }
          100% { transform: rotateX(0); opacity: 1; }
        }
        .animate-flipIn {
          animation: flipIn 0.6s ease forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}