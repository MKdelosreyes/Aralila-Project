"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const MAX_HEARTS = 3;

type HeartsDisplayProps = {
  variant?: "light" | "dark";
};

export const HeartsDisplay = ({ variant = "dark" }: HeartsDisplayProps) => {
  const { user, refreshUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient || !user?.next_refill_at) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const refillTime = new Date(user.next_refill_at!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, refillTime - now);
      setTimeLeft(remaining);

      if (remaining <= 0 && user.current_hearts! < MAX_HEARTS) {
        refreshUser();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [isClient, user?.next_refill_at, user?.current_hearts, refreshUser]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const styles = {
    light: {
      container: "bg-rose-50 border-rose-200 hover:bg-rose-100",
      hearts: "text-rose-500",
      timer: "text-rose-400",
    },
    dark: {
      container:
        "bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm",
      hearts: "text-white",
      timer: "text-purple-200",
    },
  };

  const currentStyle = styles[variant];
  const hearts = user?.current_hearts ?? MAX_HEARTS;

  if (!isClient) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${currentStyle.container}`}
      >
        <Image src="/images/art/heart.svg" height={20} width={20} alt="Heart" />
        <span className={`text-sm font-bold ${currentStyle.hearts}`}>
          {MAX_HEARTS}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${currentStyle.container}`}
    >
      <Image src="/images/art/heart.svg" height={24} width={24} alt="Heart" />
      <div className="flex items-center gap-2">
        <span className={`text-xl font-bold ${currentStyle.hearts}`}>
          {hearts}
        </span>
        {timeLeft > 0 && hearts < MAX_HEARTS && (
          <>
            <span className={`text-sm ${currentStyle.timer}`}>•</span>
            <span className={`text-sm font-medium ${currentStyle.timer}`}>
              {formatTime(timeLeft)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
