import { useState, useEffect } from "react";
import { env } from "@/lib/env";

export interface AreaProgress {
  areaOrderIndex: number;  
  challengesPracticed: number;
  averagePracticeScore: number;
  assessmentUnlocked: boolean;
  assessmentPassed: boolean;
  recommendedReadiness: 'not-ready' | 'ready' | 'well-prepared';
}

export function useAreaUnlocks() {
  const [unlockedAreas, setUnlockedAreas] = useState<number[]>([0]); 
  const [areaProgress, setAreaProgress] = useState<Map<number, AreaProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnlocksAndProgress();
  }, []);

  const fetchUnlocksAndProgress = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUnlockedAreas([0]); 
        setLoading(false);
        return;
      }

      const areasResponse = await fetch(
        `${env.backendUrl}/api/games/areas/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (areasResponse.ok) {
        const data = await areasResponse.json();
        
        const unlocked = data.areas
          .filter((area: any) => !area.is_locked)
          .map((area: any) => area.order_index);  
        
        if (!unlocked.includes(0)) {
          unlocked.unshift(0);
        }
        
        console.log("Unlocked areas (order_index):", unlocked);
        setUnlockedAreas(unlocked);
        
        const progressMap = new Map<number, AreaProgress>();
        
        data.areas.forEach((area: any) => {
          progressMap.set(area.order_index, {  
            areaOrderIndex: area.order_index,
            challengesPracticed: area.completed_games || 0,
            averagePracticeScore: area.average_score || 0,
            assessmentUnlocked: area.completed_games >= 3,
            assessmentPassed: area.completed_games === area.total_games,
            recommendedReadiness: calculateReadiness(
              area.completed_games || 0,
              area.average_score || 0,
              area.total_games || 6
            ),
          });
        });
        
        console.log("Area progress map:", progressMap);
        setAreaProgress(progressMap);
      } else {
        console.warn("Failed to fetch areas, using fallback");
        setUnlockedAreas([0]);
      }
    } catch (error) {
      console.error("Failed to fetch area unlocks and progress:", error);
      setUnlockedAreas([0]); 
    } finally {
      setLoading(false);
    }
  };

  const calculateReadiness = (
    completedGames: number,
    avgScore: number,
    totalGames: number
  ): 'not-ready' | 'ready' | 'well-prepared' => {
    const completionRate = completedGames / totalGames;
    const scoreThreshold = avgScore >= 70;

    if (completionRate >= 0.8 && scoreThreshold) return 'well-prepared';
    if (completionRate >= 0.5 && scoreThreshold) return 'ready';
    return 'not-ready';
  };

  // ✅ Now checks order_index instead of database ID
  const isAreaLocked = (orderIndex: number) => !unlockedAreas.includes(orderIndex);
  
  // ✅ Now uses order_index
  const getAreaProgress = (orderIndex: number): AreaProgress | null => {
    return areaProgress.get(orderIndex) || null;
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