"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, LayoutGroup } from "framer-motion";
import { X, Star, Zap, HandHelping } from "lucide-react";
import {
  PunctuationChallengeGameProps,
  PunctuationResult,
} from "@/types/games";
import {
  PUNCTUATION_MARKS,
  TIME_LIMIT as DATA_TIME,
  BONUS_TIME,
  BASE_POINTS,
  splitIntoWords,
} from "@/data/games/punctuation-task";
import { ConfirmationModal } from "../confirmation-modal";

const TIME_LIMIT = 120;
const MAX_ASSISTS = 3;
type LilaState = "normal" | "happy" | "sad" | "worried";

type PlatformUnit =
  | { type: "platform"; text: string; isEnd?: boolean }
  | { type: "gap"; position: number; correctMark: string };

type PlatformOnly = Extract<PlatformUnit, { type: "platform" }>;

const buildPlatforms = (
  sentence: string,
  correctPunctuation: { position: number; mark: string }[]
): PlatformUnit[] => {
  const words = splitIntoWords(sentence);

  const sorted = [...correctPunctuation].sort((a, b) => {
    const aPos = a.position === -1 ? Number.MAX_SAFE_INTEGER : a.position;
    const bPos = b.position === -1 ? Number.MAX_SAFE_INTEGER : b.position;
    return aPos - bPos;
  });

  const units: PlatformUnit[] = [];
  let startWord = 0;

  sorted.forEach((p) => {
    const endWord = p.position === -1 ? words.length : p.position + 1;
    const segment = words.slice(startWord, endWord).join(" ").trim();
    if (segment.length > 0) {
      units.push({ type: "platform", text: segment });
    }
    units.push({ type: "gap", position: p.position, correctMark: p.mark });
    startWord = endWord;
  });

  if (startWord < words.length) {
    units.push({ type: "platform", text: words.slice(startWord).join(" ") });
  }

  // Landing pad
  units.push({ type: "platform", text: "", isEnd: true });
  return units;
};

const DialogueBubble = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative bg-purple-100 text-purple-800 p-3 rounded-xl shadow-sm min-w-[220px] text-center"
  >
    {children}
  </motion.div>
);

export const PunctuationChallengeGame = ({
  sentences,
  onGameComplete,
  onExit,
}: PunctuationChallengeGameProps) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const [results, setResults] = useState<PunctuationResult[]>([]);
  const [currentGapIndex, setCurrentGapIndex] = useState(0);
  const [filledGaps, setFilledGaps] = useState<
    { position: number; mark: string; isCorrect: boolean }[]
  >([]);

  const [timeLeft, setTimeLeft] = useState(DATA_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const [lilaState, setLilaState] = useState<LilaState>("normal");
  const [autoSlideToEnd, setAutoSlideToEnd] = useState(false);

  // Assists system
  const [assists, setAssists] = useState(MAX_ASSISTS);
  const [showAssistPrompt, setShowAssistPrompt] = useState(false);
  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<string | null>(
    null
  );

  const currentSentenceData = sentences[currentQIndex];

  const platforms = useMemo(
    () =>
      buildPlatforms(
        currentSentenceData.sentence,
        currentSentenceData.correctPunctuation
      ),
    [currentSentenceData]
  );

  const platformUnits = useMemo(
    () => platforms.filter((p) => p.type === "platform") as PlatformOnly[],
    [platforms]
  );

  const gaps = useMemo(
    () =>
      platforms.filter((p) => p.type === "gap") as Extract<
        PlatformUnit,
        { type: "gap" }
      >[],
    [platforms]
  );

  const currentGap = gaps[currentGapIndex];
  const totalGaps = gaps.length;

  // Lila index = cleared gaps + optional extra slide to end
  const lilaPlatformIndex = currentGapIndex + (autoSlideToEnd ? 1 : 0);

  const lilaImage = `/images/character/lila-${lilaState}.png`;

  // Horizontal scrolling camera
  const trackRef = useRef<HTMLDivElement | null>(null);
  const platformRefs = useRef<(HTMLDivElement | null)[]>([]);

  const centerPlatformInView = (index: number) => {
    const container = trackRef.current;
    const el = platformRefs.current[index];
    if (!container || !el) return;

    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();

    const currentLeft = container.scrollLeft;
    const offset =
      eRect.left -
      cRect.left +
      currentLeft -
      (cRect.width / 2 - eRect.width / 2);

    container.scrollTo({ left: offset, behavior: "smooth" });
  };

  // Keep camera centered on Lila’s current platform
  useEffect(() => {
    centerPlatformInView(lilaPlatformIndex);
  }, [lilaPlatformIndex, platforms.length]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onGameComplete({ score, results: [...results] });
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, onGameComplete, results, score]);

  const finalizeSentence = (
    answers: { position: number; mark: string; isCorrect: boolean }[],
    completedGaps: number
  ) => {
    const isAllCorrect =
      completedGaps === currentSentenceData.correctPunctuation.length &&
      answers.every((g) => g.isCorrect);

    const result: PunctuationResult = {
      sentenceData: currentSentenceData,
      userAnswer: answers.map(({ position, mark }) => ({ position, mark })),
      isCorrect: isAllCorrect,
      completedGaps,
    };

    setResults((prev) => [...prev, result]);

    if (isAllCorrect) {
      setScore((s) => s + BASE_POINTS + streak * 5);
      setStreak((st) => st + 1);
      setTimeLeft((t) => Math.min(t + BONUS_TIME, TIME_LIMIT));
    } else {
      setStreak(0);
    }
  };

  const goNext = () => {
    setCurrentGapIndex(0);
    setFilledGaps([]);
    setLilaState("normal");
    setAutoSlideToEnd(false);

    if (currentQIndex + 1 < sentences.length) {
      setCurrentQIndex((i) => i + 1);
    } else {
      onGameComplete({ score, results: [...results] });
    }
  };

  const slideDur = 800;

  const handlePickPunctuation = (mark: string) => {
    if (!currentGap) return;

    const isCorrect = currentGap.correctMark === mark;

    if (isCorrect) {
      const nextAnswers = [
        ...filledGaps,
        { position: currentGap.position, mark, isCorrect: true },
      ];

      setFilledGaps(nextAnswers);
      setLilaState("happy");

      const nextIndex = currentGapIndex + 1;
      setCurrentGapIndex(nextIndex);

      if (nextIndex >= totalGaps) {
        const nextPlatform = platformUnits[nextIndex];
        const hasTrailingText = nextPlatform && !nextPlatform.isEnd;

        if (hasTrailingText) {
          setTimeout(() => {
            setAutoSlideToEnd(true);
          }, slideDur);

          setTimeout(() => {
            setAutoSlideToEnd(false);
            finalizeSentence(nextAnswers, nextIndex);
            setTimeout(goNext, 300);
          }, slideDur * 2 + 50);
        } else {
          setTimeout(() => {
            finalizeSentence(nextAnswers, nextIndex);
            setTimeout(goNext, 300);
          }, slideDur);
        }
      }
    } else {
      // Wrong answer - check if assists available
      if (assists > 0) {
        setPendingWrongAnswer(mark);
        setShowAssistPrompt(true);
        setLilaState("worried");
      } else {
        // No assists - proceed to next item
        proceedAfterWrongAnswer();
      }
    }
  };

  const handleUseAssist = () => {
    setAssists((a) => a - 1);
    setShowAssistPrompt(false);
    setPendingWrongAnswer(null);
    setLilaState("normal");

    // Player can try again - gap remains the same
  };

  const handleDeclineAssist = () => {
    setShowAssistPrompt(false);
    setPendingWrongAnswer(null);
    proceedAfterWrongAnswer();
  };

  const proceedAfterWrongAnswer = () => {
    setLilaState("sad");
    setStreak(0);
    setScore((s) => Math.max(0, s - 2));
    setTimeLeft((t) => Math.max(0, t - 3));

    // Record wrong answer and skip to next item
    const answers = [...filledGaps];

    // Fill remaining gaps with blank/incorrect marks
    for (let i = currentGapIndex; i < totalGaps; i++) {
      answers.push({
        position: gaps[i].position,
        mark: i === currentGapIndex ? pendingWrongAnswer || "" : "",
        isCorrect: false,
      });
    }

    // Slide to end
    const nextPlatform = platformUnits[totalGaps];
    const hasTrailingText = nextPlatform && !nextPlatform.isEnd;

    setCurrentGapIndex(totalGaps);

    if (hasTrailingText) {
      setTimeout(() => setAutoSlideToEnd(true), slideDur);

      setTimeout(() => {
        setAutoSlideToEnd(false);
        finalizeSentence(answers, filledGaps.length);
        setTimeout(goNext, 300);
      }, slideDur * 2 + 50);
    } else {
      setTimeout(() => {
        finalizeSentence(answers, filledGaps.length);
        setTimeout(goNext, 300);
      }, slideDur);
    }
  };

  const handleSkip = () => {
    const answers = [...filledGaps];

    // Fill remaining gaps with blank/incorrect marks
    for (let i = currentGapIndex; i < totalGaps; i++) {
      answers.push({
        position: gaps[i].position,
        mark: "",
        isCorrect: false,
      });
    }

    // Animate: move to trailing platform (if any), then to end, then finalize
    const nextPlatform = platformUnits[totalGaps]; // platform after last gap
    const hasTrailingText = nextPlatform && !nextPlatform.isEnd;

    // First slide to platform after last gap (trailing text or end)
    setCurrentGapIndex(totalGaps);

    if (hasTrailingText) {
      // Then second slide to end
      setTimeout(() => setAutoSlideToEnd(true), slideDur);

      setTimeout(() => {
        setAutoSlideToEnd(false);
        finalizeSentence(answers, filledGaps.length); // completedGaps = answered count only
        setTimeout(goNext, 300);
      }, slideDur * 2 + 50);
    } else {
      // Already at end platform
      setTimeout(() => {
        finalizeSentence(answers, filledGaps.length);
        setTimeout(goNext, 300);
      }, slideDur);
    }

    setStreak(0);
    setLilaState("worried");
    setScore((s) => Math.max(0, s - 5)); // optional small penalty
  };

  const setPlatformRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      platformRefs.current[i] = el;
    },
    []
  );

  const renderTrack = () => {
    let gapCounter = 0;
    let platformCounter = 0;

    return (
      <div
        ref={trackRef}
        className="w-full overflow-x-auto scrollbar-hide mx-5"
      >
        <LayoutGroup>
          {/* Inline flex row wider than viewport; scroll horizontally */}
          <div className="inline-flex items-start justify-center gap-6 select-none relative min-w-full px-6">
            {platforms.map((unit, idx) => {
              if (unit.type === "platform") {
                const index = platformCounter++;
                const isLilaHere = index === lilaPlatformIndex;

                // Calculate platform width based on text length
                const calculatePlatformWidth = (
                  text: string,
                  isEnd?: boolean
                ) => {
                  if (isEnd) return "w-28";
                  if (!text) return "w-28";

                  // Base calculation: ~8px per character + padding
                  const charWidth = 14; // Adjust this value to fine-tune spacing
                  const minWidth = 80; // Minimum width in pixels
                  const maxWidth = 400; // Maximum width in pixels
                  const padding = 40; // Extra padding on both sides

                  const calculatedWidth = Math.min(
                    Math.max(text.length * charWidth + padding, minWidth),
                    maxWidth
                  );

                  return `w-[${calculatedWidth}px]`;
                };

                const platformWidth = calculatePlatformWidth(
                  unit.text,
                  unit.isEnd
                );

                return (
                  <div
                    key={`p-${idx}`}
                    ref={setPlatformRef(index)}
                    className="flex flex-col items-center relative"
                  >
                    {/* Fixed vertical zone keeps the row aligned */}
                    <div className="h-28 flex items-end justify-center">
                      {isLilaHere && (
                        <motion.img
                          layoutId="lila"
                          src={lilaImage}
                          alt="Lila"
                          initial={false}
                          transition={{
                            type: "tween",
                            ease: "easeInOut",
                            duration: 0.8,
                          }}
                          className="w-24 h-24 mb-2 pointer-events-none"
                        />
                      )}
                    </div>

                    {/* Platform bar with dynamic width */}
                    <div
                      className={`h-3 rounded-md bg-slate-700 ${platformWidth}`}
                      style={
                        !unit.isEnd && unit.text
                          ? {
                              width: `${Math.min(
                                Math.max(unit.text.length * 14 + 40, 80),
                                400
                              )}px`,
                            }
                          : undefined
                      }
                    />

                    {/* Label BELOW the platform */}
                    {unit.text && (
                      <div
                        className="mt-2 min-h-8 text-xl text-slate-700 font-semibold whitespace-pre-wrap text-center px-2"
                        style={{
                          maxWidth: `${Math.min(
                            Math.max(unit.text.length * 14 + 40, 80),
                            400
                          )}px`,
                        }}
                      >
                        {unit.text}
                      </div>
                    )}
                  </div>
                );
              }

              // Gap unit: platform bar + answer tile below
              const gapIndex = gapCounter++;
              const wasAnswered = gapIndex < filledGaps.length;
              const answered = filledGaps[gapIndex];
              const showing = wasAnswered ? answered?.mark : "";
              const isActive = gapIndex === currentGapIndex;

              return (
                <div key={`g-${idx}`} className="flex flex-col items-center">
                  {/* Spacer aligns with Lila zone */}
                  <div className="h-28" />

                  {/* Short platform segment (bridge) */}
                  <div className="h-3 w-20 bg-slate-700 rounded-md" />

                  {/* Answer tile below */}
                  <div
                    className={`mt-2 h-10 w-12 rounded-lg border-2 flex items-center justify-center bg-slate-100 text-xl
                      ${isActive ? "border-purple-500" : "border-slate-400"}`}
                  >
                    {showing || (isActive ? "?" : "")}
                  </div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    );
  };

  return (
    <div className="relative z-10 max-w-6xl w-full mx-auto p-4">
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
        title={"Lumabas sa Laro?"}
        description="Sigurado ka ba na gusto mong umalis? Hindi mase-save ang iyong score."
      />
      {/* Assist Prompt Modal */}
      {showAssistPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <HandHelping className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Mali!</h3>
              <p className="text-slate-600 text-center">
                Gusto mo bang gumamit ng assist para subukan ulit?
              </p>
              <div className="flex items-center gap-2 text-purple-600">
                <HandHelping className="w-5 h-5" />
                <span className="font-bold">{assists} assists natitira</span>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={handleDeclineAssist}
                  className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Hindi
                </button>
                <button
                  onClick={handleUseAssist}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
                >
                  Oo, gamitin
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col w-full">
        <div className="w-full flex items-center gap-4 mb-2">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-100"
          >
            <X className="w-6 h-6" />
          </button>
          {/* Time bar */}
          <div className="w-full bg-slate-200 rounded-full h-4">
            <motion.div
              className={`h-4 rounded-full transition-colors duration-500 ${
                timeLeft <= 15
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-purple-500 to-fuchsia-500"
              }`}
              animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          <div className="flex items-center gap-4 text-slate-700">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold">{score}</span>
            </div>
            {streak > 1 && (
              <motion.div
                className="flex items-center gap-1 text-orange-500"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Zap className="w-5 h-5" />
                <span className="text-lg font-bold">x{streak}</span>
              </motion.div>
            )}
            {/* Assists counter */}
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <HandHelping className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {assists}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5">
          <div className="relative w-full h-[400px] flex flex-col gap-6 mb-8 mt-4 rounded-2xl overflow-hidden border-4 border-dashed border-purple-200">
            <div className="flex-1 flex items-center justify-center">
              {renderTrack()}
            </div>

            <div className="flex items-center justify-center gap-4 mb-5">
              {PUNCTUATION_MARKS.map((m) => (
                <button
                  key={m}
                  onClick={() => handlePickPunctuation(m)}
                  disabled={showAssistPrompt}
                  className={`h-12 w-12 rounded-xl border-2 text-xl font-bold
                    ${
                      currentGap && currentGap.correctMark === m
                        ? "border-purple-500/60"
                        : "border-slate-400"
                    }
                    bg-slate-100 hover:bg-slate-200 active:scale-95 transition
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex justify-between items-center pt-5 border-t border-slate-200">
          <button
            onClick={handleSkip}
            disabled={showAssistPrompt}
            className="px-7 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
};
