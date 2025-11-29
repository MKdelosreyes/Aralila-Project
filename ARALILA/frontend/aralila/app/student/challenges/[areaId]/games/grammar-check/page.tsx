"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { GrammarCheckIntro } from "@/components/games/grammar-check/intro";
import { GrammarCheckGame } from "@/components/games/grammar-check/game";
import { GrammarCheckSummary, GrammarResult } from "@/components/games/grammar-check/summary";
import { grammarAccuracyQuestions } from "@/data/GrammarAccuracyData";
import { buildRuntimeQuestions, RuntimeGrammarQuestion } from "@/lib/utils";
import { env } from "@/lib/env";
import { TutorialModal } from "../TutorialModal"; // <-- add TutorialModal

type GameState = "intro" | "playing" | "summary";
type Difficulty = 1 | 2 | 3;

/* -------------------------------------------
   Tutorial steps for Grammar Check
--------------------------------------------*/
const tutorialSteps = [
  {
    videoSrc: "/videos/GRAMATIKA_GALORE/1.mp4",
    description: "Basahin ang bawat salita nang mabuti.",
  },
  {
    videoSrc: "/videos/GRAMATIKA_GALORE/2.mp4",
    description: "Tiyakin kung ano ang bawat salita.",
  },
  {
    videoSrc: "/videos/GRAMATIKA_GALORE/3.mp4",
    description: "Hilahin ang mga salita sa tamang puwesto hanggang mabuo ang pangungusap.",
  },
];

const GrammarCheckPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area") || "1";
  const initialDifficulty = parseInt(searchParams.get("difficulty") || "1");

  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty);
  const [questions, setQuestions] = useState<RuntimeGrammarQuestion[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<GrammarResult[]>([]);
  const [gameData, setGameData] = useState<any>(null);
  const [unlocked, setUnlocked] = useState<{ [k: number]: boolean }>({
    1: true,
    2: false,
    3: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAreaId, setResolvedAreaId] = useState<number | null>(null);

  /* -------------------------------------------
     Tutorial state
  --------------------------------------------*/
  const [showTutorial, setShowTutorial] = useState(false);

  const toDifficulty = (n: number): Difficulty => {
    if (n === 2) return 2;
    if (n === 3) return 3;
    return 1;
  };

  /* -------------------------------------------
     Initialization
  --------------------------------------------*/
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const orderIndex = parseInt(areaId, 10);
        const areaResp = await fetch(
          `${env.backendUrl}/api/games/area/order/${orderIndex}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!areaResp.ok) throw new Error("Failed to load area");

        const areaJson = await areaResp.json();
        setResolvedAreaId(areaJson.area.id);

        const grammar = (areaJson.games || []).find(
          (g: any) => g.game_type === "grammar-check"
        );

        if (grammar) {
          const du = grammar.difficulty_unlocked || {};
          const mapped: Record<Difficulty, boolean> = {
            1: true,
            2: !!(du[2] ?? du["2"]),
            3: !!(du[3] ?? du["3"]),
          };
          setUnlocked(mapped);

          const requestedRaw = initialDifficulty;
          const requested = toDifficulty(requestedRaw);
          const highest: Difficulty = mapped[3] ? 3 : mapped[2] ? 2 : 1;
          setCurrentDifficulty(mapped[requested] ? requested : highest);
          setGameData(grammar);
        } else {
          setUnlocked({ 1: true, 2: false, 3: false });
          setCurrentDifficulty(1);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load game");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [areaId]);

  /* -------------------------------------------
     Fetch Questions
  --------------------------------------------*/
  const fetchQuestions = async (rawAreaParam: string, difficulty: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        router.push("/auth/login");
        return;
      }

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
        }
      } catch (e) {
        console.warn("Area lookup failed, using raw param as id.");
      }

      const response = await fetch(
        `${env.backendUrl}/api/games/questions/${actualAreaId}/grammar-check/${difficulty}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load questions");
      }

      const data = await response.json();

      if (!data.questions?.length) {
        setError("No questions available for this difficulty level.");
        return;
      }

      const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 10);
      setQuestions(buildRuntimeQuestions(selected));

      setGameData({
        ...data,
        total_pool: data.questions.length,
        used_count: selected.length,
      });
    } catch (error: any) {
      setError(error.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------
     Start Game
  --------------------------------------------*/
  const handleStart = async () => {
    setError(null);
    setLoading(true);

    try {
      await fetchQuestions(areaId, currentDifficulty);

      // Move to playing state after questions loaded
      setTimeout(() => {
        setGameState("playing");
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------
     Game Complete
  --------------------------------------------*/
  const handleGameComplete = async ({
    percentScore,
    rawPoints,
    results,
  }: {
    percentScore: number;
    rawPoints: number;
    results: GrammarResult[];
  }) => {
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
          area_id: resolvedAreaId ?? parseInt(areaId, 10),
          game_type: "grammar-check",
          difficulty: currentDifficulty,
          score: percentScore,
        }),
      });

      const data = await response.json().catch(() => ({}));
      setGameData((prev: any) => ({ ...prev, ...data, raw_points: rawPoints }));
    } catch (error) {
      console.error("Failed to submit score:", error);
    }

    setGameState("summary");
  };

  /* -------------------------------------------
     Restart
  --------------------------------------------*/
  const handleRestart = () => {
    setGameState("intro");
    setFinalScore(0);
    setFinalResults([]);
    fetchQuestions(areaId, currentDifficulty);
  };

  /* -------------------------------------------
     Back Button
  --------------------------------------------*/
  const handleBack = () => {
    router.push(`/student/challenges?area=${areaId}`);
  };

  /* -------------------------------------------
     Render Game State
  --------------------------------------------*/
  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <GrammarCheckGame
            questions={questions}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <GrammarCheckSummary
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
          <GrammarCheckIntro
            difficulty={currentDifficulty}
            unlocked={unlocked}
            onSelectDifficulty={(d) => setCurrentDifficulty(d)}
            onStartChallenge={handleStart}
            onBack={handleBack}
            onHelp={() => setShowTutorial(true)} // <-- show tutorial modal
          />
        );
    }
  };

  /* -------------------------------------------
     Page Render
  --------------------------------------------*/
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <AnimatedBackground />

      <div className="w-full flex items-center justify-center">{renderGameState()}</div>

      {/* -----------------------------
           Tutorial Modal
      ------------------------------ */}
      {showTutorial && (
        <TutorialModal steps={tutorialSteps} onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
};

export default GrammarCheckPage;
