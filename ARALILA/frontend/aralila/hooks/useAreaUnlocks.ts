import { useState, useEffect } from "react";
import { env } from "@/lib/env";

export interface AreaProgress {
  areaOrderIndex: number;  
  challengesPracticed: number;
  averagePracticeScore: number;
  assessmentUnlocked: boolean;
  assessmentPassed: boolean;
  gamesWithStars: number; 
  recommendedReadiness: 'not-ready' | 'ready' | 'well-prepared';
}

// Add these interfaces to match your backend data
interface Area {
  id: number;
  order_index: number;
  name: string;
  completed_games: number;
  total_games: number;
  average_score: number;
  is_locked: boolean;
}

interface GameProgress {
  area_id: number;
  stars_earned: number;
}

interface AssessmentProgress {
  area_id: number;
  passed: boolean;
}

export function useAreaUnlocks() {
  const [unlockedAreas, setUnlockedAreas] = useState<number[]>([0]); 
  const [areas, setAreas] = useState<Area[]>([]);
  const [games, setGames] = useState<GameProgress[]>([]);
  const [assessments, setAssessments] = useState<AssessmentProgress[]>([]);
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
        
        // Store areas data
        setAreas(data.areas || []);
        
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
          // Calculate games with stars (you'll need to fetch this from backend)
          const gamesWithStars = 0; // TODO: Get from backend
          
          progressMap.set(area.order_index, {  
            areaOrderIndex: area.order_index,
            challengesPracticed: area.completed_games || 0,
            averagePracticeScore: area.average_score || 0,
            assessmentUnlocked: area.completed_games >= 3,
            assessmentPassed: area.completed_games === area.total_games,
            gamesWithStars: gamesWithStars,
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

  const isAreaLocked = (orderIndex: number) => !unlockedAreas.includes(orderIndex);
  
  // ✅ Fixed: Now returns properties matching AreaProgress interface
  const getAreaProgress = (orderIndex: number): AreaProgress | null => {
    const area = areas.find((a) => a.order_index === orderIndex);
    if (!area) return null;

    // Calculate games with at least 1 star
    const gamesWithStars = games.filter(
      (g) => g.area_id === area.id && g.stars_earned >= 1
    ).length;

    // Calculate assessment passed status
    const assessmentPassed = assessments.some(
      (a) => a.area_id === area.id && a.passed === true
    );

    // Determine readiness based on stars
    let recommendedReadiness: 'well-prepared' | 'ready' | 'not-ready' = 'not-ready';
    
    if (gamesWithStars === area.total_games) {
      recommendedReadiness = 'well-prepared';
    } else if (gamesWithStars >= Math.floor(area.total_games * 0.5)) {
      recommendedReadiness = 'ready';
    }

    // ✅ Return properties matching the AreaProgress interface
    return {
      areaOrderIndex: area.order_index,
      challengesPracticed: area.completed_games,
      averagePracticeScore: area.average_score,
      assessmentUnlocked: area.completed_games >= 3,
      assessmentPassed,
      gamesWithStars,
      recommendedReadiness,
    };
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