"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import { PunctuationChallengeIntro } from "@/components/games/punctuation-task/intro";
import { PunctuationChallengeGame } from "@/components/games/punctuation-task/game";
import { PunctuationChallengeSummary } from "@/components/games/punctuation-task/summary";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { PunctuationData, PunctuationResult } from "@/types/games";
import { TutorialModal } from "../TutorialModal"; // <-- ADD THIS

type GameState = "intro" | "playing" | "summary";
type Difficulty = 1 | 2 | 3;

/* -------------------------------------------
   Tutorial steps for Punctuation Challenge
--------------------------------------------*/
const tutorialSteps = [
  {
    videoSrc: "/videos/PUNTUHANG_PUNTOS/1.mp4",
    description: "Basahin ang pangungusap.",
  },
  {
    videoSrc: "/videos/PUNTUHANG_PUNTOS/2.mp4",
    description: "Suriin kung anong bantas ang nararapat.",
  },
  {
    videoSrc: "/videos/PUNTUHANG_PUNTOS/3.mp4",
    description: "Pindutin ang tamang bantas bilang iyong sagot.",
  },
];

const PunctuationChallengePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area") || "1";
  const initialDifficulty = parseInt(searchParams.get("difficulty") || "1");

  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty);
  const [questions, setQuestions] = useState<PunctuationData[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<PunctuationResult[]>([]);
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

        const punctuationTask = (areaJson.games || []).find(
          (g: any) => g.game_type === "punctuation-task"
        );

        if (punctuationTask) {
          const du = punctuationTask.difficulty_unlocked || {};

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
          setGameData(punctuationTask);
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
        setError("Not authenticated");
        router.push("/login");
        return;
      }

      const orderIndex = parseInt(rawAreaParam, 10);
      let actualAreaId = orderIndex;

      const areaResp = await fetch(
        `${env.backendUrl}/api/games/area/order/${orderIndex}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (areaResp.ok) {
        const areaData = await areaResp.json();
        actualAreaId = areaData.area.id;
        setResolvedAreaId(actualAreaId);
      }

      const response = await fetch(
        `${env.backendUrl}/api/games/questions/${actualAreaId}/punctuation-task/${difficulty}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load questions");
      }

      const data = await response.json();

      if (!data.questions?.length) {
        setError("No questions available.");
        return;
      }

      const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 10);

      setQuestions(selected);
      setGameData({
        ...data,
        total_pool: data.questions.length,
        used_count: selected.length,
      });

      return selected;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------
      Start Game
  --------------------------------------------*/
  const handleStart = async () => {
    const data = await fetchQuestions(areaId, currentDifficulty);
    if (data?.length) {
      setGameState("playing");
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
    results: PunctuationResult[];
  }) => {
    setFinalScore(percentScore);
    setFinalResults(results);
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
          <PunctuationChallengeGame
            sentences={questions}
            difficulty={currentDifficulty}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );

      case "summary":
        return (
          <PunctuationChallengeSummary
            score={finalScore}
            results={finalResults}
            difficulty={currentDifficulty}
            starsEarned={gameData?.stars_earned || 0}
            nextDifficulty={gameData?.next_difficulty}
            difficultyUnlocked={gameData?.difficulty_unlocked}
            replayMode={gameData?.replay_mode}
            rawPoints={gameData?.raw_points}
            onRestart={handleRestart}
            onChangeDifficulty={(d) => {
              setCurrentDifficulty(d);
              setGameState("intro");
            }}
          />
        );

      case "intro":
      default:
        return (
          <PunctuationChallengeIntro
            difficulty={currentDifficulty}
            unlocked={unlocked}
            onSelectDifficulty={(d) => setCurrentDifficulty(d)}
            onStartChallenge={handleStart}
            onBack={handleBack}
            onHelp={() => setShowTutorial(true)} // <-- SHOW TUTORIAL
          />
        );
    }
  };

  /* -------------------------------------------
      Page Render
  --------------------------------------------*/
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-800">
      <AnimatedBackground />
      <div className="w-full flex items-center justify-center overflow-hidden">
        {renderGameState()}
      </div>

      {/* -----------------------------  
           Tutorial Modal 
      ------------------------------ */}
      {showTutorial && (
        <TutorialModal
          steps={tutorialSteps}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
};

export default PunctuationChallengePage;
