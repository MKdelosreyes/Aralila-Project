"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DifficultyProgressProps {
  averageScoreByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export function DifficultyProgress({
  averageScoreByDifficulty,
}: DifficultyProgressProps) {
  const difficulties = [
    {
      name: "Easy",
      value: averageScoreByDifficulty.easy,
      color: "bg-green-500",
      emoji: "😊",
    },
    {
      name: "Medium",
      value: averageScoreByDifficulty.medium,
      color: "bg-yellow-500",
      emoji: "🤔",
    },
    {
      name: "Hard",
      value: averageScoreByDifficulty.hard,
      color: "bg-red-500",
      emoji: "😤",
    },
  ];

  return (
    <Card className="bg-white border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎚️</span>
          Performance by Difficulty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {difficulties.map((diff, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span>{diff.emoji}</span>
                  {diff.name}
                </span>
                <span className="text-sm font-bold text-purple-600">
                  {diff.value.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${diff.color} transition-all duration-300`}
                  style={{ width: `${Math.min(diff.value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
