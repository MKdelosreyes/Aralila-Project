import { useState, useEffect } from "react";
import { env } from "@/lib/env";

export interface AreaProgress {
  areaId: number;
  challengesPracticed: number; // 0-6 games practiced
  averagePracticeScore: number; // 0-100%
  assessmentUnlocked: boolean;
  assessmentPassed: boolean;
  recommendedReadiness: 'not-ready' | 'ready' | 'well-prepared';
}

export function useAreaUnlocks() {
  const [unlockedAreas, setUnlockedAreas] = useState<number[]>([1]); // Playground default
  const [areaProgress, setAreaProgress] = useState<Map<number, AreaProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnlocksAndProgress();
  }, []);

  const fetchUnlocksAndProgress = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Fetch unlocked areas
      const unlocksResponse = await fetch(
        `${env.backendUrl}/api/progress/unlocked-areas/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (unlocksResponse.ok) {
        const unlocksData = await unlocksResponse.json();
        setUnlockedAreas(unlocksData.unlocked_area_ids || [1]);
      }

      // Fetch progress for each area
      const progressResponse = await fetch(
        `${env.backendUrl}/api/progress/all-areas/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        const progressMap = new Map<number, AreaProgress>();
        
        progressData.areas.forEach((area: any) => {
          progressMap.set(area.areaId, {
            areaId: area.areaId,
            challengesPracticed: area.challengesPracticed || 0,
            averagePracticeScore: area.averagePracticeScore || 0,
            assessmentUnlocked: area.assessmentUnlocked || false,
            assessmentPassed: area.assessmentPassed || false,
            recommendedReadiness: calculateReadiness(
              area.challengesPracticed || 0,
              area.averagePracticeScore || 0
            ),
          });
        });
        
        setAreaProgress(progressMap);
      }
    } catch (error) {
      console.error("Failed to fetch area unlocks and progress:", error);
      // Fallback: only playground unlocked
      setUnlockedAreas([1]);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadiness = (
    practiceCount: number,
    avgScore: number
  ): 'not-ready' | 'ready' | 'well-prepared' => {
    const practiceRate = practiceCount / 6;
    const scoreThreshold = avgScore >= 70;

    if (practiceRate >= 0.8 && scoreThreshold) return 'well-prepared';
    if (practiceRate >= 0.5 && scoreThreshold) return 'ready';
    return 'not-ready';
  };

  const isAreaLocked = (areaId: number) => !unlockedAreas.includes(areaId);
  
  const getAreaProgress = (areaId: number): AreaProgress | null => {
    return areaProgress.get(areaId) || null;
  };

  const refreshProgress = () => {
    fetchUnlocksAndProgress();
  };

  return {
    unlockedAreas,
    isAreaLocked,
    getAreaProgress,
    loading,
    refreshProgress,
  };
}