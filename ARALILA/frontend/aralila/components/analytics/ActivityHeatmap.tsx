"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TimeAnalytics } from "@/types/PerformanceAnalytics";

interface ActivityHeatmapProps {
  data: TimeAnalytics;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const maxCount = Math.max(...data.activity_by_day.map((d) => d.count), 1);

  const getIntensity = (count: number) => {
    const percentage = (count / maxCount) * 100;
    if (percentage === 0) return "bg-gray-100";
    if (percentage < 25) return "bg-purple-200";
    if (percentage < 50) return "bg-purple-400";
    if (percentage < 75) return "bg-purple-600";
    return "bg-purple-800";
  };

  return (
    <Card className="bg-white border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          Activity Pattern
        </CardTitle>
        <CardDescription>Kailan ka pinaka-aktibo sa pag-aaral</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day of Week Activity */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Araw ng Linggo
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {data.activity_by_day.map((day, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`h-12 rounded-md ${getIntensity(
                      day.count
                    )} flex items-center justify-center transition-all hover:scale-105`}
                    title={`${day.day}: ${day.count} sessions`}
                  >
                    <span className="text-xs font-bold text-white">
                      {day.count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {day.day.substring(0, 3)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Most Active Day</p>
              <p className="text-lg font-bold text-purple-600">
                {data.most_active_day || "N/A"}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-lg font-bold text-purple-600">
                {data.total_sessions}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
