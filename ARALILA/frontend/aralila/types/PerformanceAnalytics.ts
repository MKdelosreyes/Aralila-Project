export interface AnalyticsDashboard {
  overview: {
    totalGamesPlayed: number;
    totalStarsEarned: number;
    areasUnlocked: number;
    currentStreak: number;
    longestStreak: number;
  };
  averageScoreByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  scoreImprovement: ScoreImprovement[];
  skillMastery: SkillMastery;
  insights: Insight[];
  timeAnalytics: TimeAnalytics;
}

export interface ScoreImprovement {
  game_id: number;
  game_name: string;
  first_attempt: number;
  best_score: number;
  improvement_percentage: number;
}

export interface SkillMastery {
  spelling: number;
  punctuation: number;
  grammar: number;
  vocabulary: number;
  sentenceConstruction: number;
}

export interface Insight {
  type: 'improvement' | 'challenge' | 'celebration' | 'practice' | 'achievement';
  icon: string;
  message: string;
  message_en?: string;
  action?: string;
  game_type?: string;
}

export interface TimeAnalytics {
  peak_hour: number | null;
  most_active_day: string | null;
  total_sessions: number;
  total_time_minutes: number;
  recent_sessions: number;
  activity_by_day: {
    day: string;
    count: number;
  }[];
}

interface PerformanceAnalytics {
  // Overall Progress
  totalGamesPlayed: number;
  totalStarsEarned: number;
  areasUnlocked: number;
  currentStreak: number; // Consecutive days playing

  // Performance Trends
  averageScoreByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };

  // Improvement Tracking
  scoreImprovement: {
    game_id: number;
    first_attempt: number;
    best_score: number;
    improvement_percentage: number;
  }[];

  // Time-based Insights
  totalTimeSpent: number; // in minutes
  averageTimePerGame: number;
  mostActiveDay: string; // "Monday", "Tuesday", etc.

  // Skill-specific Mastery
  skillMastery: {
    spelling: number; // 0-100%
    punctuation: number;
    grammar: number;
    vocabulary: number;
    sentenceConstruction: number;
  };
}


interface AssistAnalytics {
  totalAssistedChallenges: number;
  assistRateByGame: {
    game_name: string;
    assist_rate: number; // % of times they used hints
  }[];
  mostDifficultConcepts: string[]; // Areas where assists were most used
}