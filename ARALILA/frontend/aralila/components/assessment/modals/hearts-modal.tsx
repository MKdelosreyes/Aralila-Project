"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHeartsModal } from "@/store/use-hearts-modal";

const HEART_REFILL_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds (adjust as needed)

export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [refillTime, setRefillTime] = useState<number | null>(null);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (isOpen && isClient) {
      const savedRefillTime = localStorage.getItem("heartRefillTime");

      if (savedRefillTime) {
        const refillTimestamp = parseInt(savedRefillTime, 10);
        const now = Date.now();
        const remaining = refillTimestamp - now;

        if (remaining > 0) {
          setRefillTime(refillTimestamp);
          setTimeLeft(remaining);
        } else {
          // Time expired, clear storage
          localStorage.removeItem("heartRefillTime");
          setRefillTime(null);
          setTimeLeft(0);
        }
      } else {
        // First time out of hearts, set new refill time
        const newRefillTime = Date.now() + HEART_REFILL_TIME;
        localStorage.setItem("heartRefillTime", newRefillTime.toString());
        setRefillTime(newRefillTime);
        setTimeLeft(HEART_REFILL_TIME);
      }
    }
  }, [isOpen, isClient]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = (refillTime || 0) - now;

      if (remaining <= 0) {
        localStorage.removeItem("heartRefillTime");
        setTimeLeft(0);
        clearInterval(interval);
        close();
        router.push("/student/dashboard");
        window.location.reload(); // Refresh to reset hearts
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeLeft, refillTime, close, router]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleExitAssessment = () => {
    close();
    router.push("/student/dashboard");
  };

  if (!isClient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/images/character/lila-sad.png"
              alt="Mascot Sad"
              height={80}
              width={80}
            />
          </div>

          <DialogTitle className="text-center text-2xl font-bold">
            You ran out of hearts!
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            {timeLeft > 0 ? (
              <>
                <div className="my-4">
                  <div className="text-4xl font-bold text-rose-500 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-neutral-600">
                    until hearts refill
                  </div>
                </div>
                <p className="text-sm text-neutral-500">
                  All 3 hearts will be restored automatically. Take a break and
                  come back!
                </p>
              </>
            ) : (
              <p className="text-green-600 font-semibold">
                Your hearts have been refilled! 🎉
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            {timeLeft > 0 ? (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={handleExitAssessment}
                >
                  Exit Assessment
                </Button>
                <Button
                  variant="primaryOutline"
                  className="w-full"
                  size="lg"
                  onClick={close}
                  disabled
                >
                  Wait {formatTime(timeLeft)}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={() => {
                  close();
                  window.location.reload();
                }}
              >
                Continue Playing
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
