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
import { Button } from "@/components/ui/button";
import { error } from "console";

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
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [selectedPunctuation, setSelectedPunctuation] = useState<
    Array<{ mark: string; position: number }>
  >([]);
  const [taggedWords, setTaggedWords] = useState<Record<number, string>>({});

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
            .catch(() =>
              toast.error("Something went wrong. Please try again.")
            );
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

        // ✅ Store AI feedback for COMPOSE challenges
        if (challenge.type === "COMPOSE" && result.ai_feedback) {
          setAiFeedback(result.ai_feedback);
          setAiScore(result.score || 100);
        }

        // Mark as completed
        await upsertChallengeProgress(challenge.id);
        setPercentage((prev) => prev + 100 / challenges.length);
      } else {
        setStatus("wrong");

        // ✅ Show AI feedback even for wrong answers
        if (challenge.type === "COMPOSE" && result.ai_feedback) {
          setAiFeedback(result.ai_feedback);
          setAiScore(result.score || 0);
        }

        if (initialPercentage !== 100) {
          await reduceHearts();
          setHearts((prev) => Math.max(prev - 1, 0));
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
      ? "Arrange the words correctly"
      : challenge.type === "PUNCTUATE"
      ? "Add the correct punctuation"
      : challenge.type === "TAG_POS"
      ? challenge.question
      : challenge.type === "COMPOSE"
      ? challenge.question
      : challenge.question;

  return (
    <div className="flex h-full flex-col">
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <div className="flex items-center justify-between">
              <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
                {title}
              </h1>
            </div>

            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}

              <Challenge
                challenge={challenge}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                // 👇 NEW: Pass additional handlers
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
          pending ||
          isChecking ||
          (challenge.type === "SELECT" || challenge.type === "ASSIST"
            ? !selectedOption
            : challenge.type === "SPELL" || challenge.type === "COMPOSE"
            ? !textAnswer?.trim()
            : challenge.type === "ARRANGE"
            ? arrangedWords.length === 0
            : challenge.type === "PUNCTUATE"
            ? selectedPunctuation.length === 0
            : challenge.type === "TAG_POS"
            ? Object.keys(taggedWords).length !== (challenge.words?.length || 0)
            : true)
        }
        status={status}
        onCheck={onContinue}
        resetAssessment={resetAssessment}
        isChecking={isChecking}
      />
    </div>
  );
};
