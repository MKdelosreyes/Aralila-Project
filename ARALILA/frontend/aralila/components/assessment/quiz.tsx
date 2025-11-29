"use client";

import { useState, useTransition } from "react";

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

const MAX_HEARTS = 5;

type ChallengeType = {
  id: number;
  type: string;
  question: string;
  order: number;
  completed: boolean;
  challengeOptions: ChallengeOption[];
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

  useMount(() => {
    if (initialPercentage === 100) openPracticeModal();
  });

  const [lessonId] = useState(initialLessonId);
  const [areaId] = useState(initialAreaId);
  const [hearts, setHearts] = useState(initialHearts);
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

    const response = await fetch(
      `${env.backendUrl}/api/games/assessment/reduce-hearts/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reduce hearts");
    }

    return response.json();
  };

  const onContinue = () => {
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

    const correctOption = options.find(
      (option: ChallengeOption) => option.correct
    );

    if (!correctOption) return;

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

            // This is a practice
            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, MAX_HEARTS));
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."));
      });
    } else {
      // playIncorrectSound();
      setStatus("wrong");

      if (initialPercentage !== 100) {
        startTransition(() => {
          reduceHearts()
            .then((response) => {
              if (response?.error === "hearts") {
                openHeartsModal();
                return;
              }

              if (!response?.error) {
                setHearts((prev) => Math.max(prev - 1, 0));
              }
            })
            .catch(() =>
              toast.error("Something went wrong. Please try again.")
            );
        });
      }
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
          onCheck={() => router.push("/student/challenges")}
        />
      </>
    );
  }

  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;

  return (
    <>
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
              {title}
            </h1>

            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}

              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
