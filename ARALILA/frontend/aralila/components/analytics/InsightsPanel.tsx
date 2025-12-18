"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Insight } from "@/types/PerformanceAnalytics";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const router = useRouter();

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "improvement":
        return "bg-blue-50 border-blue-200";
      case "challenge":
        return "bg-purple-50 border-purple-200";
      case "celebration":
        return "bg-yellow-50 border-yellow-200";
      case "practice":
        return "bg-green-50 border-green-200";
      case "achievement":
        return "bg-pink-50 border-pink-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card className="bg-white border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Personalized Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${getInsightColor(
                  insight.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{insight.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {insight.message}
                    </p>
                    {insight.action && (
                      <Button
                        onClick={() => router.push(insight.action!)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Subukan Ngayon
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Maglaro pa para makakuha ng personalized insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
