"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScoreImprovement } from "@/types/PerformanceAnalytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ImprovementChartProps {
  improvements: ScoreImprovement[];
}

export function ImprovementChart({ improvements }: ImprovementChartProps) {
  const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <Card className="bg-white border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Top Improvements
        </CardTitle>
        <CardDescription>
          Mga laro kung saan bumuti ang iyong performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {improvements.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={improvements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="game_name"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{
                  value: "Improvement %",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid #8b5cf6",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value}%`, "Improvement"]}
              />
              <Bar dataKey="improvement_percentage" radius={[8, 8, 0, 0]}>
                {improvements.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Maglaro pa para makita ang iyong improvement!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
