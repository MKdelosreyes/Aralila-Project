"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { createClient } from "@/lib/supabase/client";

export default function ReviewPage() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAreaId, setResolvedAreaId] = useState<number | null>(null);
  const [areaName, setAreaName] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const areaParam = searchParams.get("area") || "0";

  const supabase = createClient();

  const wordVariations: Record<string, number> = {
    bola: 1,
    laro: 4,
    sample: 3,
  };

  const getQuestionImage = (word: string) => {
    const base = word.split("_")[0].toLowerCase();
    const max = wordVariations[base] || 1;
    const index = max === 1 ? 1 : Math.floor(Math.random() * max) + 1;
    const fileName = `${base}.jpg`;

    const { data } = supabase.storage
      .from("area_1")
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      console.warn("Supabase image fetch returned empty URL for", fileName);
      return "";
    }

    return data.publicUrl;
  };

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        let areaId = parseInt(areaParam, 10);
        try {
          const areaResp = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/games/area/order/${areaId}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!areaResp.ok) throw new Error("Failed to fetch area");
          const areaData = await areaResp.json();
          areaId = areaData.area.id;
          setResolvedAreaId(areaId);
          setAreaName(areaData.area.name || `Area ${areaId}`);
        } catch {
          console.warn("Failed to resolve area ID, using raw param");
          setResolvedAreaId(areaId);
          setAreaName(`Area ${areaId}`);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/games/spelling/${areaId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          let msg = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errData = await response.json();
            msg = errData.error || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = await response.json();
        setQuestions(data.questions || []);

        // Preload Supabase image URLs
        const urls: Record<string, string> = {};
        for (const q of data.questions || []) {
          urls[q.word] = getQuestionImage(q.word);
        }
        setImageUrls(urls);
      } catch (err: any) {
        setError(err.message || "Failed to fetch questions");
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [user, areaParam, router]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (loadingQuestions) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black text-white">
        Loading questions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black text-red-500">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black text-gray-300">
        No spelling questions found for this area.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <AnimatedBackground />
      <Sidebar />

      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12 w-full">
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center">
    Balik Tingin  {/*- {areaName} */}
  </h1>

  {/* Flip Card */}
  <div
    className="w-full max-w-md sm:max-w-2xl md:max-w-3xl aspect-[4/3] perspective mb-4 cursor-pointer"
    onClick={() => setFlipped(!flipped)}
  >
    <div
      className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
        flipped ? "rotate-x-180" : ""
      }`}
    >
      {/* Front */}
      <div className="absolute w-full h-full backface-hidden bg-gray-700 border border-purple-600 rounded-xl flex flex-col items-center justify-center p-4 sm:p-6">
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-300 text-center">
          {currentQuestion.word}
        </p>
        <p className="text-sm sm:text-base md:text-lg text-gray-200 mt-2 text-center">
          {currentQuestion.sentence}
        </p>
        <p className="text-xs sm:text-sm md:text-base text-yellow-300 mt-2">
          Difficulty: {currentQuestion.difficulty}
        </p>
      </div>

      {/* Back */}
      <div className="absolute w-full h-full backface-hidden bg-gray-700 border border-purple-600 rounded-xl flex items-center justify-center p-2 sm:p-4 rotate-x-180">
        <img
          src={imageUrls[currentQuestion.word] || ""}
          alt={imageUrls[currentQuestion.word] }
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  </div>

  {/* Fullscreen toggle */}
  {fullscreen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 cursor-pointer p-2 sm:p-4"
      onClick={() => setFullscreen(false)}
    >
      <div
        className={`relative w-full max-w-xl sm:max-w-4xl md:max-w-5xl h-[80vh] sm:h-[85vh] md:h-[90vh] transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? "rotate-x-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-gray-700 border border-purple-600 rounded-xl flex flex-col items-center justify-center p-4 sm:p-6">
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-300 text-center">
            {currentQuestion.word}
          </p>
          <p className="text-sm sm:text-lg md:text-xl text-gray-200 mt-2 text-center">
            {currentQuestion.sentence}
          </p>
          <p className="text-xs sm:text-sm md:text-lg text-yellow-300 mt-2">
            Difficulty: {currentQuestion.difficulty}
          </p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-gray-700 border border-purple-600 rounded-xl flex items-center justify-center p-2 sm:p-4 rotate-x-180">
          <img
            src={imageUrls[currentQuestion.word] || ""}
            alt={currentQuestion.word}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  )}

  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2">
    <button
      onClick={handlePrev}
      disabled={currentIndex === 0}
      className="px-4 cursor-pointer py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 w-full sm:w-auto"
    >
      Previous
    </button>
    <button
      onClick={handleNext}
      disabled={currentIndex === questions.length - 1}
      className="px-4 cursor-pointer py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 w-full sm:w-auto"
    >
      Next
    </button>
  </div>

  {/* <p className="text-gray-400 text-center text-sm sm:text-base">
    Question {currentIndex + 1} of {questions.length}
  </p> */}
</main>


      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-x-180 {
          transform: rotateX(180deg);
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
