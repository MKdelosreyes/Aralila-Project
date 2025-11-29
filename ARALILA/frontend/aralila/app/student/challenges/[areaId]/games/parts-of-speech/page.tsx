"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { PartsOfSpeechIntro } from "@/components/games/parts-of-speech/intro";
import { PartsOfSpeechGame } from "@/components/games/parts-of-speech/game";
import { PartsOfSpeechSummary } from "@/components/games/parts-of-speech/summary";
import { partsOfSpeechData } from "@/data/games/parts-of-speech";
import {
  PartsOfSpeechDifficulty,
  PartsOfSpeechResult,
  SpellingResult,
} from "@/types/games";

type GameState = "intro" | "playing" | "summary";

// type Difficulty = 1 | 2 | 3;

const PartsOfSpeechPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area") || "1";
  const initialDifficulty = parseInt(searchParams.get("difficulty") || "1");

  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentDifficulty, setCurrentDifficulty] =
    useState<PartsOfSpeechDifficulty>(
      (initialDifficulty === 2 || initialDifficulty === 3
        ? initialDifficulty
        : 1) as PartsOfSpeechDifficulty
    );
  const [questions, setQuestions] = useState(partsOfSpeechData);
  const [finalScore, setFinalScore] = useState(0);
  const [finalResults, setFinalResults] = useState<PartsOfSpeechResult[]>([]);
  const [gameData, setGameData] = useState<any>(null);
  const [unlocked, setUnlocked] = useState<{ [k: number]: boolean }>({
    1: true,
    2: false,
    3: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAreaId, setResolvedAreaId] = useState<number | null>(null);

  const toDifficulty = (n: number): PartsOfSpeechDifficulty => {
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

        const partsOfSpeech = (areaJson.games || []).find(
          (g: any) => g.game_type === "parts-of-speech"
        );
        if (partsOfSpeech) {
          const du = partsOfSpeech.difficulty_unlocked || {};
          const mapped: Record<PartsOfSpeechDifficulty, boolean> = {
            1: true,
            2: !!(du[2] ?? du["2"]),
            3: !!(du[3] ?? du["3"]),
          };
          setUnlocked(mapped);

          // Validate URL difficulty; fallback to highest available or 1
          const requestedRaw = initialDifficulty;
          const requested = toDifficulty(requestedRaw);

          const highest: PartsOfSpeechDifficulty = mapped[3]
            ? 3
            : mapped[2]
            ? 2
            : 1;
          setCurrentDifficulty(mapped[requested] ? requested : highest);
          setGameData(partsOfSpeech);
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

  const fetchQuestions = async (
    rawAreaParam: string,
    difficulty: PartsOfSpeechDifficulty
  ) => {
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
        } else {
          console.warn("Area-by-order lookup failed, using raw param as id.");
        }
      } catch (e) {
        console.warn("Area-by-order request error, using raw param as id.");
      }

      const response = await fetch(
        `${env.backendUrl}/api/games/questions/${actualAreaId}/parts-of-speech/${difficulty}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 403) {
        const data = await response.json();
        setError(data.error || "Access denied");
        alert(data.error);
        router.back();
        return;
      }

      if (response.status === 500) {
        let errorDetails = "Internal server error. Please try again later.";
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorDetails;
        } catch {}
        setError(errorDetails);
        return;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.questions || data.questions.length === 0) {
        setError("No questions available for this difficulty level.");
        return;
      }

      console.log("First questions:", data.questions[0]);

      const transformedQuestions = data.questions.flatMap((q: any) => {
        if (!q.words || q.words.length === 0) return [];

        return q.words.map((wordObj: any) => ({
          id: `${q.id}-${wordObj.id}`,
          sentence: q.sentence,
          word: wordObj.word,
          correctAnswer: wordObj.correct_answer,
          hint: q.hint,
          explanation: q.explanation,
        }));
      });

      console.log("Transformed questions:", transformedQuestions);

      const validQuestions = transformedQuestions.filter(
        (q: any) => q.sentence && q.word && q.correctAnswer
      );

      if (validQuestions.length === 0) {
        setError("No valid questions available.");
        return;
      }

      const shuffled = [...validQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 10);

      console.log("Selected questions:", selected);
      console.log("First selected question:", selected[0]);

      setQuestions(selected);
      setGameData({
        ...data,
        total_pool: validQuestions.length,
        used_count: selected.length,
      });

      if (data.skip_message) {
        console.log("Skip message:", data.skip_message);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setError(null);
    setLoading(true);

    try {
      await fetchQuestions(areaId, currentDifficulty);
      setGameState("playing");
    } catch (error) {
      console.error("Error starting game:", error);
      setError("Failed to start game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async ({
    percentScore,
    rawPoints,
    results,
  }: {
    percentScore: number;
    rawPoints: number;
    results: PartsOfSpeechResult[];
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
            game_type: "parts-of-speech",
            difficulty: currentDifficulty,
            score: percentScore,
          }),
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("submit-score failed", response.status, err);
      }
      const data = await response.json().catch(() => ({}));
      setGameData((prev: any) => ({ ...prev, ...data, raw_points: rawPoints }));
    } catch (error) {
      console.error("Failed to submit score:", error);
    }

    setGameState("summary");
  };

  const handleReviewLessons = () => {
    console.log("Review lessons clicked for Parts of Speech");
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
          <PartsOfSpeechGame
            questions={questions}
            difficulty={currentDifficulty}
            onGameComplete={handleGameComplete}
            onExit={handleRestart}
          />
        );
      case "summary":
        return (
          <PartsOfSpeechSummary
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
          <PartsOfSpeechIntro
            difficulty={currentDifficulty}
            unlocked={unlocked}
            onSelectDifficulty={(d) => setCurrentDifficulty(d)}
            onStartChallenge={handleStart}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <AnimatedBackground imagePath={getAreaBGImage()} />
      <div className="w-full flex items-center justify-center overflow-hidden">
        {renderGameState()}
      </div>
    </div>
  );
};

export default PartsOfSpeechPage;
