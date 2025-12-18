"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SkillMastery } from "@/types/PerformanceAnalytics";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillMasteryChartProps {
  mastery: SkillMastery;
}

export function SkillMasteryChart({ mastery }: SkillMasteryChartProps) {
  const data = [
    { skill: "Spelling", value: mastery.spelling, fullMark: 100 },
    { skill: "Punctuation", value: mastery.punctuation, fullMark: 100 },
    { skill: "Grammar", value: mastery.grammar, fullMark: 100 },
    { skill: "Vocabulary", value: mastery.vocabulary, fullMark: 100 },
    {
      skill: "Sentence Building",
      value: mastery.sentenceConstruction,
      fullMark: 100,
    },
  ];

  return (
    <Card className="h-full flex flex-col bg-transparent border-2 text-start text-white font-bold">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 justify-start font-bold text-purple-400">
          Skill Mastery
        </CardTitle>
        <CardDescription className="text-start text-white font-bold">
          Tingnan ang iyong kasanayan sa iba't ibang larangan ng Filipino.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.35)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{
                fill: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                stroke: "#000000",
                strokeWidth: 0.8,
                paintOrder: "stroke",
              }}
            />

            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{
                fill: "#ffffff",
                fontSize: 11,
                fontWeight: 600,
                stroke: "#000000",
                strokeWidth: 0.6,
                paintOrder: "stroke",
              }}
              axisLine={false}
            />

            <Radar
              name="Skill Level"
              dataKey="value"
              stroke="#7c3aed"
              strokeWidth={3}
              fill="url(#skillGradient)"
              fillOpacity={0.75}
            />

            <defs>
              <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>

            <Tooltip
              contentStyle={{
                backgroundColor: "#faf5ff",
                border: "2px solid #a855f7",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                fontWeight: 600,
              }}
              formatter={(value) => [`${value}%`, "Mastery"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
