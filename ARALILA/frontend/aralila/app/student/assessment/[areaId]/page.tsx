"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { Quiz } from "@/components/assessment/quiz";
import { ChallengeType } from "@/types/games";

type LessonData = {
  id: number;
  areaId: number;
  title: string;
  challenges: ChallengeType[];
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [hearts, setHearts] = useState(() => {
    if (typeof window !== "undefined") {
      const savedHearts = localStorage.getItem("currentHearts");
      const savedRefillTime = localStorage.getItem("heartRefillTime");

      if (savedRefillTime) {
        const refillTimestamp = parseInt(savedRefillTime, 10);
        if (Date.now() < refillTimestamp) {
          return 0;
        }
      }

      return savedHearts ? parseInt(savedHearts, 10) : 3;
    }
    return 3;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, []);

  const fetchAssessment = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const areaId = parseInt(params.areaId as string, 10);

      if (isNaN(areaId)) {
        throw new Error("Invalid area ID");
      }

      const response = await fetch(
        `${env.backendUrl}/api/games/assessment/${params.areaId}/`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (response.status === 403) {
        const data = await response.json();
        alert(data.error);
        router.back();
        return;
      }

      if (!response.ok) throw new Error("Failed to load assessment");

      const data = await response.json();
      const shuffledChallenges = shuffleArray(data.challenges);
      setLessonData({
        ...data,
        challenges: shuffledChallenges,
        areaId: areaId,
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load assessment");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!lessonData) return null;

  const initialPercentage =
    (lessonData.challenges.filter((c) => c.completed).length /
      lessonData.challenges.length) *
    100;

  return (
    <div className="h-screen">
      <Quiz
        initialLessonId={lessonData.id}
        initialAreaId={lessonData.areaId}
        initialLessonChallenges={lessonData.challenges}
        initialHearts={hearts}
        initialPercentage={initialPercentage}
        userSubscription={null}
      />
    </div>
  );
}
