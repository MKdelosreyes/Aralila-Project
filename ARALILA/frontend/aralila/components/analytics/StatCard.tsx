"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
}: StatCardProps) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500",
  };

  const getImageIcon = (title: string) => {
    switch (title) {
      case "Total Stars":
        return "/images/character/lila-stars.png";
      case "Games Played":
        return "/images/character/lila-computer.png";
      case "Current Streak":
        return "/images/character/lila-streak.png";
      case "Total Time":
        return "/images/character/lila-thinking.png";
      default:
        return "/images/character/lila-happy.png";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-gradient-to-br from-white to-gray-50 border-2 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Image src={getImageIcon(title)} alt={title} width={65} height={65} />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {subtitle && (
            <p
              className={`text-xs mt-1 ${
                trend ? trendColors[trend] : "text-gray-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
