"use client";

import { useState, useTransition, useEffect } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useWindowSize, useMount } from "react-use";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";

import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { ResultCard } from "./result-card";
import { QuizProps, ChallengeOption } from "@/types/games";
import { Button } from "@/components/ui/button";
import { error } from "console";
import { useAuth } from "@/contexts/AuthContext";

const MAX_HEARTS = 5;

type ChallengeType = {
  id: number;
  type: string;
  question: string;
  order: number;
  completed: boolean;
  challengeOptions: ChallengeOption[];
  correctAnswer?: string;
  imagePrompt?: string;
  words?: Array<{
    id: number;
    text: string;
    word?: string;
    index?: number;
    correctTag?: string;
    correctPosition?: number;
  }>;
  punctuationMarks?: Array<{ id: number; mark: string; positions: number[] }>;
  posOptions?: Array<{ id: number; text: string; isCorrect: boolean }>;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialAreaId,
  initialLessonChallenges,
  userSubscription,
}: QuizProps) => {
  const { width, height } = useWindowSize();

  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [aiScore, setAiScore] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  useMount(() => {
    if (initialPercentage === 100) openPracticeModal();
  });

  const [lessonId] = useState(initialLessonId);
  const [areaId] = useState(initialAreaId);
  const { user, refreshUser } = useAuth();
  const [hearts, setHearts] = useState(initialHearts);
  // If there's no authenticated user yet, ensure we use the prop initialHearts
  useEffect(() => {
    if (user?.current_hearts === undefined && typeof initialHearts === "number") {
      setHearts(initialHearts);
      try {
        localStorage.setItem("currentHearts", String(initialHearts));
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [initialHearts, user?.current_hearts]);

  const [overlayTimeLeft, setOverlayTimeLeft] = useState<number>(0);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );

    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"none" | "wrong" | "correct">("none");

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [selectedPunctuation, setSelectedPunctuation] = useState<
    Array<{ mark: string; position: number }>
  >([]);
  const [taggedWords, setTaggedWords] = useState<Record<number, string>>({});

  useEffect(() => {
    if (user?.current_hearts !== undefined) {
      setHearts(user.current_hearts);
    }
  }, [user?.current_hearts]);

  useEffect(() => {
    const checkHeartRefill = () => {
      const savedRefillTime = localStorage.getItem("heartRefillTime");

      if (savedRefillTime) {
        const refillTimestamp = parseInt(savedRefillTime, 10);
        const now = Date.now();

        if (now >= refillTimestamp) {
          // Time expired, refill hearts
          localStorage.removeItem("heartRefillTime");
          localStorage.setItem("currentHearts", "3");
          setHearts(3);
          toast.success("Your hearts have been refilled! 💖");
        } else if (hearts === 0) {
          // Still waiting for refill -> show modal/overlay
          openHeartsModal();
        }
      }
    };

    // Run on mount and when hearts change so UI responds immediately when hearts hit 0
    checkHeartRefill();
  }, [hearts, openHeartsModal]);

  useEffect(() => {
    if (hearts !== 0) return;

    const updateOverlayTime = () => {
      const savedRefillTime = localStorage.getItem("heartRefillTime");
      if (savedRefillTime) {
        const refillTimestamp = parseInt(savedRefillTime, 10);
        const now = Date.now();
        const remaining = Math.max(0, refillTimestamp - now);
        setOverlayTimeLeft(remaining);
      }
    };

    updateOverlayTime();
    const interval = setInterval(updateOverlayTime, 1000);

    return () => clearInterval(interval);
  }, [hearts]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Play audio functions using native Audio API
  const playCorrectSound = () => {
    const audio = new Audio("/correct.wav");
    audio.play().catch((err) => console.log("Audio play failed:", err));
  };

  const playIncorrectSound = () => {
    const audio = new Audio("/incorrect.wav");
    audio.play().catch((err) => console.log("Audio play failed:", err));
  };

  const playFinishSound = () => {
    const audio = new Audio("/finish.mp3");
    audio.play().catch((err) => console.log("Audio play failed:", err));
  };

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  // Replace server action with API call
  const upsertChallengeProgress = async (challengeId: number) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${env.backendUrl}/api/games/assessment/submit-challenge/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save progress");
    }

    return response.json();
  };

  // Replace server action with API call
  const reduceHearts = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`${env.backendUrl}/api/users/hearts/reduce/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    // Parse JSON even on non-OK so we can read server-provided fields
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse reduce hearts response");
    }

    if (!response.ok) {
      // Handle explicit server error (e.g., no hearts)
      if (data?.error) {
        // If server included next_refill_at, persist it
        if (data.next_refill_at) {
          const ts = Date.parse(data.next_refill_at);
          if (!Number.isNaN(ts)) {
            localStorage.setItem("heartRefillTime", String(ts));
          }
        }

        if (data.error === "No hearts available") {
          setHearts(0);
          localStorage.setItem("currentHearts", "0");
          openHeartsModal();
        }

        throw new Error(data.error);
      }

      throw new Error("Failed to reduce hearts");
    }

    // Success path
    // Ensure we update local state from authoritative server value
    if (typeof data.current_hearts === "number") {
      setHearts(data.current_hearts);
      localStorage.setItem("currentHearts", String(data.current_hearts));
    }

    // If server returned next_refill_at (ISO string), persist as ms
    if (data?.next_refill_at) {
      const ts = Date.parse(data.next_refill_at);
      if (!Number.isNaN(ts)) {
        localStorage.setItem("heartRefillTime", String(ts));
      }
    }

    await refreshUser();

    return data;
  };

  const onContinue = () => {
    if (hearts === 0 && initialPercentage !== 100) {
      openHeartsModal();
      return;
    }

    if (challenge.type === "SELECT" || challenge.type === "ASSIST") {
      if (!selectedOption) return;

      if (status === "wrong") {
        setStatus("none");
        setSelectedOption(undefined);
        return;
      }

      if (status === "correct") {
        onNext();
        setStatus("none");
        setSelectedOption(undefined);
        return;
      }

      setIsChecking(true);

      const correctOption = options.find(
        (option: ChallengeOption) => option.correct
      );

      if (!correctOption) {
        setIsChecking(false);
        return;
      }

      if (correctOption.id === selectedOption) {
        startTransition(() => {
          upsertChallengeProgress(challenge.id)
            .then((response) => {
              if (response?.error === "hearts") {
                openHeartsModal();
                return;
              }

              playCorrectSound();
              setStatus("correct");
              setPercentage((prev) => prev + 100 / challenges.length);

              if (initialPercentage === 100) {
                setHearts((prev) => Math.min(prev + 1, MAX_HEARTS));
              }
            })
            .catch(() => toast.error("Something went wrong. Please try again."))
            .finally(() => {
              setIsChecking(false);
            });
        });
      } else {
        setStatus("wrong");

        if (initialPercentage !== 100) {
          // Immediately decrement locally to prevent race where user can continue
          setHearts((prev) => {
            const newHearts = Math.max(prev - 1, 0);
            localStorage.setItem("currentHearts", String(newHearts));

            if (newHearts === 0) {
              const HEART_REFILL_TIME = 5 * 60 * 1000;
              const refillTime = Date.now() + HEART_REFILL_TIME;
              localStorage.setItem("heartRefillTime", refillTime.toString());
              // show modal right away
              openHeartsModal();
            }

            return newHearts;
          });

           startTransition(() => {
             // Use server response to update hearts (avoid stale state)
             reduceHearts()
               .then((response) => {
                 if (response?.error === "hearts") {
                   openHeartsModal();
                   return;
                 }

                 const serverHearts = typeof response?.current_hearts === "number" ? response.current_hearts : null;

                 if (serverHearts !== null) {
                   // persisted by reduceHearts already, but ensure refill timer is set when it hits 0
                   if (serverHearts === 0) {
                     // Prefer server-provided next_refill_at if available
                     const serverNext = response?.next_refill_at || null;
                     if (serverNext) {
                       const ts = Date.parse(serverNext);
                       if (!Number.isNaN(ts)) {
                         localStorage.setItem("heartRefillTime", String(ts));
                       }
                     } else {
                       const HEART_REFILL_TIME = 5 * 60 * 1000;
                       const refillTime = Date.now() + HEART_REFILL_TIME;
                       localStorage.setItem("heartRefillTime", refillTime.toString());
                     }
                     openHeartsModal();
                   }
                 }
               })
               .catch(() => toast.error("Something went wrong. Please try again."))
               .finally(() => {
                 setIsChecking(false);
               });
           });
        } else {
          setIsChecking(false);
        }
      }
    } else {
      if (status === "wrong") {
        setStatus("none");
        setTextAnswer("");
        setArrangedWords([]);
        setSelectedPunctuation([]);
        setTaggedWords({});
        return;
      }

      if (status === "correct") {
        onNext();
        setStatus("none");
        setTextAnswer("");
        setArrangedWords([]);
        setSelectedPunctuation([]);
        setTaggedWords({});
        setAiFeedback("");
        setAiScore(0);
        return;
      }
      validateAnswer();
    }
  };

  const validateAnswer = async () => {
    setIsChecking(true);

    try {
      let answer;

      switch (challenge.type) {
        case "SPELL":
        case "COMPOSE":
          answer = textAnswer;
          break;
        case "ARRANGE":
          answer = arrangedWords;
          break;
        case "PUNCTUATE":
          answer = selectedPunctuation;
          break;
        case "TAG_POS":
          answer = taggedWords;
          break;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${env.backendUrl}/api/games/assessment/validate-answer/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            challengeId: challenge.id,
            answer: answer,
          }),
        }
      );

      const result = await response.json();

      if (result.correct) {
        playCorrectSound();
        setStatus("correct");

        if (challenge.type === "COMPOSE" && result.ai_feedback) {
          setAiFeedback(result.ai_feedback);
          setAiScore(result.score || 100);
        }

        await upsertChallengeProgress(challenge.id);
        setPercentage((prev) => prev + 100 / challenges.length);
      } else {
        setStatus("wrong");

        // Show AI feedback even for wrong answers
        if (challenge.type === "COMPOSE" && result.ai_feedback) {
          setAiFeedback(result.ai_feedback);
          setAiScore(result.score || 0);
        }

        if (initialPercentage !== 100) {
          // Immediately decrement locally to block interaction while server call completes
          setHearts((prev) => {
            const newHearts = Math.max(prev - 1, 0);
            localStorage.setItem("currentHearts", String(newHearts));
            if (newHearts === 0) {
              const HEART_REFILL_TIME = 5 * 60 * 1000; // 5 minutes
              const refillTime = Date.now() + HEART_REFILL_TIME;
              localStorage.setItem("heartRefillTime", refillTime.toString());
              openHeartsModal();
            }
            return newHearts;
          });

          const data = await reduceHearts();
          const serverHearts = typeof data?.current_hearts === "number" ? data.current_hearts : null;
          // reconcile with server authoritative value
          if (serverHearts !== null) {
            setHearts(serverHearts);
            localStorage.setItem("currentHearts", String(serverHearts));
            if (serverHearts === 0 && data?.next_refill_at) {
              const ts = Date.parse(data.next_refill_at);
              if (!Number.isNaN(ts)) localStorage.setItem("heartRefillTime", String(ts));
            }
          }
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate answer. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const resetAssessment = async () => {
    const ok = window.confirm(
      "Restart this assessment from the beginning? Your progress for this area will be cleared."
    );
    if (!ok) return;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch(`${env.backendUrl}/api/games/assessment/reset/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ areaId }), // or { lessonId }
      });

      // Reset local UI state
      setActiveIndex(0);
      setPercentage(0);
      setSelectedOption(undefined);
      setStatus("none");
      setTextAnswer("");
      setArrangedWords([]);
      setSelectedPunctuation([]);
      setTaggedWords({});

      // Refresh to fetch challenges with all completed:false
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Failed to restart assessment");
    }
  };

  if (!challenge) {
    playFinishSound();

    const submitAssessmentCompletion = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("📤 Submitting assessment:", {
          areaId,
          percentage,
          areaIdType: typeof areaId,
        });

        const response = await fetch(
          `${env.backendUrl}/api/games/assessment/complete/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              areaId: Number(areaId),
              percentage: Math.round(percentage),
            }),
          }
        );

        const data = await response.json();
        console.log("Assessment completion:", data);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Assessment submission error:", errorData);
          throw new Error(errorData.error || "Failed to submit assessment");
        }

        if (data.passed) {
          toast.success(data.message);
          if (data.next_area_unlocked) {
            toast.success(`🎉 ${data.next_area} unlocked!`);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error submitting assessment:", error);
        toast.error("Failed to save assessment progress");
      }
    };

    submitAssessmentCompletion();

    return (
      <>
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
        <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
          <Image
            src="/images/character/lila-happy.png"
            alt="Finish"
            className="hidden lg:block"
            height={200}
            width={200}
          />

          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={100}
            width={100}
          />

          <h1 className="text-lg font-bold text-neutral-700 lg:text-3xl">
            Great job! <br /> You&apos;ve completed the lesson.
          </h1>

          <div className="flex w-full items-center gap-x-4">
            <ResultCard variant="points" value={challenges.length * 10} />
            <ResultCard
              variant="hearts"
              value={userSubscription?.isActive ? Infinity : hearts}
            />
          </div>
        </div>

        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/student/dashboard")}
          resetAssessment={resetAssessment}
        />
      </>
    );
  }

  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.type === "SPELL"
      ? "Spell the word depicted by the image shown"
      : challenge.type === "ARRANGE"
      ? "Arrange the words correctly" // Arrange the words correctly
      : challenge.type === "PUNCTUATE"
      ? "Add the correct punctuation"
      : challenge.type === "TAG_POS"
      ? "" // challenge.question
      : challenge.type === "COMPOSE"
      ? "Write a sentence based on the given set of emojis" // challenge.question
      : challenge.question;

  return (
    <div className="flex h-full flex-col">
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />

      {/* Overlay when hearts are depleted */}
      {hearts === 0 && initialPercentage !== 100 && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <Image
              src="/images/character/lila-sad.png"
              alt="No Hearts"
              height={120}
              width={120}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold mb-2 text-neutral-800">
              No Hearts Left!
            </h2>

            {/* ✅ ADD: Hearts and Timer Display */}
            <div className="my-6 p-4 bg-rose-50 rounded-lg border-2 border-rose-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Image
                  src="/images/art/heart.svg"
                  height={32}
                  width={32}
                  alt="Heart"
                />
                <span className="text-4xl font-bold text-rose-500">0</span>
              </div>
              {overlayTimeLeft > 0 && (
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-rose-600">
                    {formatTime(overlayTimeLeft)}
                  </div>
                  <p className="text-sm text-neutral-600">
                    until hearts refill
                  </p>
                </div>
              )}
            </div>

            <p className="text-neutral-600 mb-6 text-sm">
              All 3 hearts will be restored automatically. Take a break and come
              back!
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="default"
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  router.push("/student/dashboard");
                }}
              >
                Exit to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => openHeartsModal()}
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            {title && (
              <div className="flex items-center justify-between">
                <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
                  {title}
                </h1>
              </div>
            )}

            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}

              <Challenge
                challenge={challenge}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={
                  pending ||
                  isChecking ||
                  hearts === 0 ||
                  status !== "none"
                }
                textAnswer={textAnswer}
                onTextChange={setTextAnswer}
                arrangedWords={arrangedWords}
                onArrange={setArrangedWords}
                selectedPunctuation={selectedPunctuation}
                onPunctuate={setSelectedPunctuation}
                taggedWords={taggedWords}
                onTag={setTaggedWords}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={
          hearts === 0 ||
          pending ||
          isChecking ||
          (status === "none" &&
            (challenge.type === "SELECT" || challenge.type === "ASSIST"
              ? !selectedOption
              : challenge.type === "SPELL" || challenge.type === "COMPOSE"
              ? !textAnswer?.trim()
              : challenge.type === "ARRANGE"
              ? arrangedWords.length === 0
              : challenge.type === "PUNCTUATE"
              ? selectedPunctuation.length === 0
              : challenge.type === "TAG_POS"
              ? Object.keys(taggedWords).length !==
                (challenge.words?.filter(
                  (w: any) => w.correctTag || w.index !== undefined
                )?.length || 0)
              : true))
        }
        status={status}
        onCheck={onContinue}
        resetAssessment={resetAssessment}
        // aiFeedback={aiFeedback}
        // aiScore={aiScore}
        isChecking={isChecking}
      />
    </div>
  );
};
