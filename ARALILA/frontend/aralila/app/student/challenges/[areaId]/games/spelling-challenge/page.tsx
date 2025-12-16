"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import AnimatedBackground from "@/components/bg/animated-bg";
import { SpellingChallengeIntro } from "@/components/games/spelling-challenge/intro";
import { SpellingChallengeGame } from "@/components/games/spelling-challenge/game";
import { SpellingChallengeSummary } from "@/components/games/spelling-challenge/summary";
import { SpellingResult } from "@/types/games";
import { spellingChallengeData } from "@/data/games/spelling-challenge";
import { TutorialModal } from "../TutorialModal";

type GameState = "intro" | "playing" | "summary";
type Difficulty = 1 | 2 | 3;

const tutorialSteps = [
  {
    videoSrc: "/videos/SPELL_MO_YAN/1.mp4",
    description: "Basahin ang hinihingi sa pangungusap.",
  },
  {
    videoSrc: "/videos/SPELL_MO_YAN/2.mp4",
    description:
      "Suriin at tiyaking tugma ang iyong sagot sa blankong nasa gilid.",
  },
  {
    videoSrc: "/videos/SPELL_MO_YAN/3.mp4",
    description:
      "Sa pagpili ng sagot, gamitin ang left and right arrow sa keyboard.",
  },
];

const SpellingChallengePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area") || "1";
  const initialDifficulty = parseInt(searchParams.get("difficulty") || "1");

  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty);
  const [questions, setQuestions] = useState(spellingChallengeData);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<SpellingResult[]>([]);
  const [gameData, setGameData] = useState<any>(null);
  const [unlocked, setUnlocked] = useState<{ [k: number]: boolean }>({
    1: true,
    2: false,
    3: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAreaId, setResolvedAreaId] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const toDifficulty = (n: number): Difficulty => {
    if (n === 2) return 2;
    if (n === 3) return 3;
    return 1;
  };

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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!areaResp.ok) throw new Error("Failed to load area");
        const areaJson = await areaResp.json();
        setResolvedAreaId(areaJson.area.id);

        const spelling = (areaJson.games || []).find(
          (g: any) => g.game_type === "spelling-challenge"
        );
        if (spelling) {
          const du = spelling.difficulty_unlocked || {};
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
          setGameData(spelling);
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

  const fetchQuestions = async (rawAreaParam: string, difficulty: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        router.push("/login");
        return;
      }

      let actualAreaId = parseInt(rawAreaParam, 10);
      try {
        const areaResp = await fetch(
          `${env.backendUrl}/api/games/area/order/${actualAreaId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (areaResp.ok) {
          const areaData = await areaResp.json();
          actualAreaId = areaData.area.id;
          setResolvedAreaId(actualAreaId);
        }
      } catch (e) {
        console.warn("Failed to resolve area ID. Using raw param.");
      }

      const response = await fetch(
        `${env.backendUrl}/api/games/questions/${actualAreaId}/spelling-challenge/${difficulty}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        let msg = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          msg = errorData.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        setError("No questions available for this difficulty level.");
        return;
      }

      const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 10));
      setGameData({
        ...data,
        total_pool: data.questions.length,
        used_count: 10,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setGameState("playing");
    fetchQuestions(areaId, currentDifficulty);
  };

  const handleGameComplete = async ({
    percentScore,
    rawPoints,
    results,
    timeTaken,
  }: {
    percentScore: number;
    rawPoints: number;
    results: SpellingResult[];
    timeTaken?: number;
  }) => {
    setFinalScore(percentScore);
    setFinalResults(results);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${env.backendUrl}/api/games/submit-score/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            area_id: resolvedAreaId ?? parseInt(areaId, 10),
            game_type: "spelling-challenge",
            difficulty: currentDifficulty,
            percent_score: percentScore,
            raw_points: rawPoints,
            time_taken: timeTaken,
          }),
        }
      );
      const data = await response.json().catch(() => ({}));
      setGameData((prev: any) => ({
        ...prev,
        ...data,
        raw_points: rawPoints,
        percent_score: percentScore,
      }));
    } catch (error) {
      console.error("Failed to submit score:", error);
    }

    setGameState("summary");
  };

  const handleRestart = () => {
    setGameState("intro");
    setFinalScore(0);
    setFinalResults([]);
    fetchQuestions(areaId, currentDifficulty);
  };

  const handleBack = () => {
    router.push(`/student/challenges?area=${areaId}`);
  };

  const getAreaBGImage = () => {
    if (resolvedAreaId === null) {
      return "/images/bg/forestbg-learn.jpg";
    }

    if (resolvedAreaId === 4) return "/images/bg/Playground.png";
    else if (resolvedAreaId === 5) return "/images/bg/Classroom.png";
    else if (resolvedAreaId === 6) return "/images/bg/Home.png";
    else if (resolvedAreaId === 7) return "/images/bg/Town.png";
    else if (resolvedAreaId === 8) return "/images/bg/Mountainside.png";
    else return "/images/bg/Playground.png";
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground imagePath={getAreaBGImage()} />
        <div className="relative z-20 rounded-3xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
            <p className="text-white font-semibold">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
        <AnimatedBackground imagePath={getAreaBGImage()} />
        <div className="relative z-20 bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold text-red-600">Oops!</h2>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
            >
              Go Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderGameState = () => {
    switch (gameState) {
      case "playing":
        return (
          <SpellingChallengeGame
            words={questions}
            difficulty={currentDifficulty}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <SpellingChallengeSummary
            score={finalScore}
            results={finalResults}
            difficulty={currentDifficulty}
            starsEarned={gameData?.stars_earned || 0}
            nextDifficulty={gameData?.next_difficulty}
            difficultyUnlocked={gameData?.difficulty_unlocked}
            replayMode={gameData?.replay_mode}
            rawPoints={gameData?.raw_points}
            areaId={resolvedAreaId || parseInt(areaId, 10)}
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
          <SpellingChallengeIntro
            difficulty={currentDifficulty}
            unlocked={unlocked}
            areaId={resolvedAreaId || parseInt(areaId, 10)}
            onSelectDifficulty={(d) => setCurrentDifficulty(d)}
            onStartChallenge={handleStart}
            onBack={handleBack}
            onHelp={() => setShowTutorial(true)} // <-- trigger tutorial modal
          />
        );
    }
  };

  return (
    <div className="relative max-h-screen min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <AnimatedBackground imagePath={getAreaBGImage()} />
      <div className="w-full flex items-center justify-center overflow-hidden">
        {renderGameState()}
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal
          steps={tutorialSteps}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
};

export default SpellingChallengePage;
