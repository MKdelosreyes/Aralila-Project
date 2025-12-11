"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const HEART_REFILL_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_HEARTS = 3;

type HeartsDisplayProps = {
  variant?: "light" | "dark";
};

export const HeartsDisplay = ({ variant = "dark" }: HeartsDisplayProps) => {
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  // ✅ Check heart status on mount
  useEffect(() => {
    if (!isClient) return;

    const checkHeartStatus = () => {
      const savedRefillTime = localStorage.getItem("heartRefillTime");
      const savedHearts = localStorage.getItem("currentHearts");

      if (savedRefillTime) {
        const refillTimestamp = parseInt(savedRefillTime, 10);
        const now = Date.now();
        const remaining = refillTimestamp - now;

        if (remaining > 0) {
          // Still waiting for refill
          setHearts(0);
          setTimeLeft(remaining);
        } else {
          // Time expired, refill hearts
          localStorage.removeItem("heartRefillTime");
          localStorage.setItem("currentHearts", MAX_HEARTS.toString());
          setHearts(MAX_HEARTS);
          setTimeLeft(0);
        }
      } else if (savedHearts) {
        const currentHearts = parseInt(savedHearts, 10);
        setHearts(Math.min(currentHearts, MAX_HEARTS));
        setTimeLeft(0);
      } else {
        localStorage.setItem("currentHearts", MAX_HEARTS.toString());
        setHearts(MAX_HEARTS);
        setTimeLeft(0);
      }
    };

    checkHeartStatus();
  }, [isClient]);

  // ✅ Countdown timer - updates every second
  useEffect(() => {
    if (!isClient || timeLeft <= 0) return;

    const interval = setInterval(() => {
      const savedRefillTime = localStorage.getItem("heartRefillTime");
      if (!savedRefillTime) {
        setTimeLeft(0);
        setHearts(MAX_HEARTS);
        localStorage.setItem("currentHearts", MAX_HEARTS.toString());
        clearInterval(interval);
        return;
      }

      const refillTimestamp = parseInt(savedRefillTime, 10);
      const now = Date.now();
      const remaining = refillTimestamp - now;

      if (remaining <= 0) {
        localStorage.removeItem("heartRefillTime");
        localStorage.setItem("currentHearts", MAX_HEARTS.toString());
        setTimeLeft(0);
        setHearts(MAX_HEARTS);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isClient, timeLeft]);

  // ✅ Format time as MM:SS
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
      <Image src="/images/art/heart.svg" height={20} width={20} alt="Heart" />
      {/* ✅ Show hearts and timer side by side */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${currentStyle.hearts}`}>
          {hearts}
        </span>
        {timeLeft > 0 && hearts === 0 && (
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
