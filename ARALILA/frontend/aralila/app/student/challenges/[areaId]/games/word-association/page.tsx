"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { WordAssociationIntro } from "@/components/games/word-association/intro";
import { WordAssociationGame } from "@/components/games/word-association/game";
import { WordAssociationSummary, WordAssociationResult, } from "@/components/games/word-association/summary";

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
  const [resolvedAreaId, setResolvedAreaId] = useState<number>(1);

    const areaId = searchParams.get("area") || "1";
  
    const [gameData, setGameData] = useState<any>(null);
    const [unlocked, setUnlocked] = useState<{ [k: number]: boolean }>({
      1: true,
      2: false,
      3: false,
    });

    const toDifficulty = (n: number): Difficulty => {
      if (n === 2) return 2;
      if (n === 3) return 3;
      return 1;
    };

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

        // Populate difficulty unlocks from backend for word-association
        const wa = (areaJson.games || []).find(
          (g: any) => g.game_type === "word-association"
        );
        if (wa) {
          const du = wa.difficulty_unlocked || {};
          const mapped: { [k: number]: boolean } = {
            1: true,
            2: !!(du[2] ?? du["2"]),
            3: !!(du[3] ?? du["3"]),
          };
          setUnlocked(mapped);

          // Validate current difficulty against unlocked; fallback to highest available
          const requested = initialDifficulty;
          const highestUnlocked = mapped[3] ? 3 : mapped[2] ? 2 : 1;
          setCurrentDifficulty(mapped[requested] ? requested : highestUnlocked);
        }
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
  const handleGameComplete = async ({ score, results }: { score: number; results: WordAssociationResult[] }) => {
    // compute percent from results (summary component also computes percent, but backend expects a percent score)
    const total = results.length || 1;
    const correct = results.filter((r) => r.isCorrect).length;
    const percentScore = Math.round((correct / total) * 100);

    setFinalScore(percentScore);
    setFinalResults(results);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${env.backendUrl}/api/games/submit-score/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          area_id: resolvedAreaId ?? parseInt(rawAreaParam, 10),
          game_type: "word-association",
          difficulty: currentDifficulty,
          score: percentScore,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("submit-score failed", response.status, err);
      }

      const data = await response.json().catch(() => ({}));
      // server should return stars_earned, difficulty_unlocked, next_difficulty etc.
      setGameData((prev: any) => ({ ...prev, ...data, raw_points: score }));

      // Update unlocked map if backend returns it
      if (data?.difficulty_unlocked) {
        const du = data.difficulty_unlocked;
        const mapped: { [k: number]: boolean } = {
          1: true,
          2: !!(du[2] ?? du["2"]),
          3: !!(du[3] ?? du["3"]),
        };
        setUnlocked(mapped);
      }

      // Optionally set next difficulty if provided and unlocked
      if (data?.next_difficulty && unlocked[data.next_difficulty]) {
        setCurrentDifficulty(data.next_difficulty as number);
      }
    } catch (error) {
      console.error("Failed to submit score:", error);
    }

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
    router.push(`/student/challenges/`);
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
            difficulty={currentDifficulty}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );

      case "summary":
        return (
          <WordAssociationSummary
            score={finalScore}
            results={finalResults}
            difficulty={currentDifficulty}
            starsEarned={gameData?.stars_earned || 0}
            nextDifficulty={gameData?.next_difficulty}
            difficultyUnlocked={gameData?.difficulty_unlocked}
            replayMode={gameData?.replay_mode}
            rawPoints={gameData?.raw_points}
            onRestart={handleRestart}
          />
        );

      case "intro":
      default:
        return (
          <WordAssociationIntro
            difficulty={currentDifficulty}
            unlocked={unlocked}
            onSelectDifficulty={(d) => {
              if (unlocked[d]) setCurrentDifficulty(d);
            }}
            onStartChallenge={handleStart}
            onBack={handleBack}
            areaId={resolvedAreaId}
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