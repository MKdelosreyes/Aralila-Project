// "use client";

// import React, { useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import AnimatedBackground from "@/components/bg/animatedforest-bg";
// import { WordAssociationIntro } from "@/components/games/word-association/intro";
// import { WordAssociationGame } from "@/components/games/word-association/game";
// import {
//   WordAssociationSummary,
//   WordAssociationResult,
// } from "@/components/games/word-association/summary";
// import { fourPicsOneWordQuestions as questions } from "@/data/WordAssociationData";

// type GameState = "intro" | "playing" | "summary";

// type difficulty = 1 | 2 | 3;

// const WordAssociationPage = () => {
//   const router = useRouter();
//   const params = useParams();
//   const areaId = params.areaId as string;

//   const [gameState, setGameState] = useState<GameState>("intro");
//   const [finalScore, setFinalScore] = useState(0);
//   const [finalResults, setFinalResults] = useState<WordAssociationResult[]>([]);

//   const handleStart = () => {
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
//     <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
//       <AnimatedBackground />
//       <div className="w-full flex items-center justify-center">
//         {renderGameState()}
//       </div>
//     </div>
//   );
// };

// export default WordAssociationPage;


"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { WordAssociationIntro } from "@/components/games/word-association/intro";
import { WordAssociationGame } from "@/components/games/word-association/game";
import {
  WordAssociationSummary,
  WordAssociationResult,
} from "@/components/games/word-association/summary";

type GameState = "intro" | "playing" | "summary";

type Difficulty = 1 | 2 | 3;

const WordAssociationPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawAreaParam = params.areaId as string;
  const initialDifficulty = parseInt(searchParams.get("difficulty") || "1");

  const [gameState, setGameState] = useState<GameState>("intro");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<WordAssociationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAreaId, setResolvedAreaId] = useState<number | null>(null);

  //
  // 1. Resolve area using /api/games/area/order/:orderIndex/
  //
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const orderIndex = parseInt(rawAreaParam, 10);
        const areaResp = await fetch(
          `${env.backendUrl}/api/games/area/order/${orderIndex}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!areaResp.ok) throw new Error("Failed to load area");

        const areaJson = await areaResp.json();
        setResolvedAreaId(areaJson.area.id);
      } catch (e: any) {
        setError(e.message || "Failed to load area");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [rawAreaParam]);

  //
  // 2. Fetch Questions (BACKEND)
  //
  const fetchQuestions = async (rawAreaParam: string, difficulty: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        router.push("/login");
        return;
      }

      // First resolve area by order index
      const orderIndex = parseInt(rawAreaParam, 10);
      let actualAreaId = orderIndex;

      try {
        const areaResp = await fetch(
          `${env.backendUrl}/api/games/area/order/${orderIndex}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (areaResp.ok) {
          const areaData = await areaResp.json();
          actualAreaId = areaData.area.id;
          setResolvedAreaId(actualAreaId);
        } else {
          console.warn("Area lookup failed, using raw param as area ID.");
        }
      } catch {
        console.warn("Area lookup request error, using raw param as area ID.");
      }

      // Fetch questions from backend
      const response = await fetch(
        `${env.backendUrl}/api/games/questions/${actualAreaId}/word-association/${difficulty}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load questions"); //fails here
      }

      const data = await response.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions available.");
      }

      // Shuffle + pick 10
      const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 10);

      setQuestions(selected);
    } catch (e: any) {
      console.error("Failed to fetch questions:", e);
      setError(e.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  //
  // 3. Start Game (fetch questions)
  //
  const handleStart = () => {
    setGameState("playing");
    fetchQuestions(rawAreaParam, currentDifficulty)
  };

  //
  // 4. When game completes
  //
  const handleGameComplete = ({ score, results }: { score: number; results: WordAssociationResult[] }) => {
    setFinalScore(score);
    setFinalResults(results);
    setGameState("summary");
  };

  //
  // 5. Restart
  //
  const handleRestart = () => {
    setGameState("intro");
    setFinalScore(0);
    setFinalResults([]);
    fetchQuestions(rawAreaParam, currentDifficulty)
  };

  //
  // 6. Back Button
  //
  const handleBack = () => {
    router.push(`/student/challenges/${rawAreaParam}`);
  };

  //
  // 7. Loading State
  //
  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground />
        <div className="relative z-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
        </div>
      </div>
    );
  }

  //
  // 8. Error State
  //
  if (error) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground />
        <div className="relative z-20 text-white text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p>{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  //
  // 9. Render Game States
  //
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

  //
  // 10. Final Page Layout
  //
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="w-full flex items-center justify-center overflow-hidden">
        {renderGameState()}
      </div>
    </div>
  );
};

export default WordAssociationPage;

// mo 90% accuracy ra kay dli mo scan? ag last input me thinks