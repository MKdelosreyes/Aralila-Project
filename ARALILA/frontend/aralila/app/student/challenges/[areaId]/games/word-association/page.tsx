"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { WordAssociationIntro } from "@/components/games/word-association/intro";
import { WordAssociationGame } from "@/components/games/word-association/game";
import {
  WordAssociationSummary,
  WordAssociationResult,
} from "@/components/games/word-association/summary";
import { fourPicsOneWordQuestions as questions } from "@/data/WordAssociationData";

type GameState = "intro" | "playing" | "summary";

type difficulty = 1 | 2 | 3;

const WordAssociationPage = () => {
  const router = useRouter();
  const params = useParams();
  const areaId = params.areaId as string;

  const [gameState, setGameState] = useState<GameState>("intro");
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<WordAssociationResult[]>([]);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameComplete = ({
    score,
    results,
  }: {
    score: number;
    results: WordAssociationResult[];
  }) => {
    setFinalScore(score);
    setFinalResults(results);
    setGameState("summary");
  };

  const handleRestart = () => {
    setGameState("intro");
    setFinalScore(0);
    setFinalResults([]);
  };

  const handleBack = () => {
    router.push(`/student/challenges/${areaId}`);
  };

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <WordAssociationGame
            questions={questions}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <WordAssociationSummary
            score={finalScore}
            results={finalResults}
            onRestart={handleRestart}
          />
        );
      case "intro":
      default:
        return (
          <WordAssociationIntro
            onStartChallenge={handleStart}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="w-full flex items-center justify-center">
        {renderGameState()}
      </div>
    </div>
  );
};

export default WordAssociationPage;


// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import AnimatedBackground from "@/components/bg/animatedforest-bg";
// import { WordAssociationIntro } from "@/components/games/word-association/intro";
// import { WordAssociationGame } from "@/components/games/word-association/game";
// import {
//   WordAssociationSummary,
//   WordAssociationResult,
// } from "@/components/games/word-association/summary";
// import { env } from "@/lib/env";

// type GameState = "intro" | "playing" | "summary";

// const WordAssociationPage = () => {
//   const router = useRouter();
//   const params = useParams();
//   const areaId = params.areaId as string;

//   const [gameState, setGameState] = useState<GameState>("intro");
//   const [questions, setQuestions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [finalScore, setFinalScore] = useState(0);
//   const [finalResults, setFinalResults] = useState<WordAssociationResult[]>([]);

//   // -------------------------------------------------------
//   // FETCH QUESTIONS FROM BACKEND
//   // -------------------------------------------------------
//   const fetchQuestions = async (areaId: string) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         router.push("/login");
//         return;
//       }

//       const response = await fetch(
//         `${env.backendUrl}/api/games/questions/${areaId}/four-pics-one-word/`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (!response.ok) {
//         const err = await response.json().catch(() => ({}));
//         throw new Error(err.error || "Failed to load questions");
//       }

//       const data = await response.json();

//       if (!data.questions || data.questions.length === 0) {
//         throw new Error("No questions available");
//       }

//       // Randomize + pick 10
//       const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
//       const selected = shuffled.slice(0, 10);

//       setQuestions(selected);
//     } catch (e: any) {
//       setError(e.message || "Error loading questions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------------------------------------------
//   // EVENT HANDLERS
//   // -------------------------------------------------------
//   const handleStart = () => {
//     fetchQuestions(areaId);
//     setGameState("playing");
//   };

//   const handleGameComplete = ({
//     score,
//     results,
//   }: {
//     score: number;
//     results: WordAssociationResult[];
//   }) => {
//     setFinalScore(score);
//     setFinalResults(results);
//     setGameState("summary");
//   };

//   const handleRestart = () => {
//     setGameState("intro");
//     setFinalScore(0);
//     setFinalResults([]);
//   };

//   const handleBack = () => {
//     router.push(`/student/challenges/${areaId}`);
//   };

//   // -------------------------------------------------------
//   // RENDER STATES (loading / error / actual game)
//   // -------------------------------------------------------
//   if (loading) {
//     return (
//       <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
//         <AnimatedBackground />
//         <p className="text-white text-lg">Loading questions...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
//         <AnimatedBackground />
//         <div className="bg-white p-6 rounded-xl shadow-lg text-center">
//           <h2 className="text-xl font-bold text-red-600 mb-2">Oops!</h2>
//           <p className="text-gray-700 mb-4">{error}</p>
//           <button
//             onClick={handleBack}
//             className="px-6 py-3 bg-purple-600 text-white rounded-xl"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // -------------------------------------------------------
//   // MAIN GAME STATE RENDERING
//   // -------------------------------------------------------
//   const renderGameState = () => {
//     switch (gameState) {
//       case "playing":
//         return (
//           <WordAssociationGame
//             questions={questions}
//             onGameComplete={handleGameComplete}
//             onExit={handleRestart}
//           />
//         );

//       case "summary":
//         return (
//           <WordAssociationSummary
//             score={finalScore}
//             results={finalResults}
//             onRestart={handleRestart}
//           />
//         );

//       case "intro":
//       default:
//         return (
//           <WordAssociationIntro
//             onStartChallenge={handleStart}
//             onBack={handleBack}
//           />
//         );
//     }
//   };

//   return (
//     <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
//       <AnimatedBackground />
//       <div className="w-full flex items-center justify-center">
//         {renderGameState()}
//       </div>
//     </div>
//   );
// };

// export default WordAssociationPage;
