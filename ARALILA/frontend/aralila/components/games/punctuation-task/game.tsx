"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
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
import { MarioBridge } from "../../ui/marioBridge";

const TIME_LIMIT = 120; //120
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
  const cps = Array.isArray(correctPunctuation) ? correctPunctuation : [];
  const words = splitIntoWords(sentence || "");
  const sorted = [...cps].sort((a, b) => {
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

type NormalizedSentence = {
  sentence: string;
  correctPunctuation: { position: number; mark: string }[];
  hint?: string;
  explanation?: string;
};

const normalizeSentence = (s: any): NormalizedSentence => {
  const sentence = s?.sentence ?? "";
  let arr: any =
    s?.answers ?? s?.correctPunctuation ?? s?.correct_punctuation ?? [];

  if (!Array.isArray(arr) && typeof arr === "object" && arr !== null) {
    arr = Object.entries(arr).map(([k, v]) => ({
      position: Number(k),
      mark: String(v),
    }));
  }

  if (Array.isArray(arr)) {
    arr = arr.map((it: any) => ({
      position:
        typeof it?.position === "number"
          ? it.position
          : typeof it?.index === "number"
          ? it.index
          : typeof it?.pos === "number"
          ? it.pos
          : typeof it?.word_index === "number"
          ? it.word_index
          : -1,
      mark: String(
        it?.mark ?? it?.symbol ?? it?.punctuation ?? it?.answer ?? ""
      ),
    }));
  } else {
    arr = [];
  }

  const filtered = arr.filter(
    (x: any) =>
      typeof x.position === "number" &&
      x.position >= -1 &&
      typeof x.mark === "string" &&
      x.mark !== ""
  );

  return {
    sentence,
    correctPunctuation: filtered,
    hint: s?.hint,
    explanation: s?.explanation,
  };
};

export const PunctuationChallengeGame = ({
  sentences,
  difficulty = 1,
  onGameComplete,
  onExit,
}: PunctuationChallengeGameProps) => {
  const normalized = useMemo(
    () => (Array.isArray(sentences) ? sentences.map(normalizeSentence) : []),
    [sentences]
  );
  const completedRef = useRef(false);
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

  const [assists, setAssists] = useState(MAX_ASSISTS);
  const [showAssistAnimation, setShowAssistAnimation] = useState(false);

  const currentSentenceData = normalized[currentQIndex] ?? {
    sentence: "",
    correctPunctuation: [],
  };

  const resultsRef = useRef<PunctuationResult[]>([]);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  const computePercent = (res: PunctuationResult[]) => {
    const total = normalized.length || 1;
    const correct = res.filter((r) => r.isCorrect).length;
    return Math.round((correct / total) * 100);
  };

  const platforms = useMemo(() => {
    return buildPlatforms(
      currentSentenceData.sentence ?? "",
      Array.isArray(currentSentenceData.correctPunctuation)
        ? currentSentenceData.correctPunctuation
        : []
    );
  }, [currentSentenceData]);

  const platformUnits = useMemo(
    () => platforms.filter((p) => p.type === "platform") as PlatformOnly[],
    [platforms]
  );

  const gaps = useMemo(() => {
    return platforms.filter((p) => p.type === "gap") as Extract<
      PlatformUnit,
      { type: "gap" }
    >[];
  }, [platforms]);

  const currentGap = gaps[currentGapIndex] || null;
  const totalGaps = gaps.length;

  const lilaPlatformIndex = currentGapIndex + (autoSlideToEnd ? 1 : 0);
  const lilaImage = `/images/character/lila-${lilaState}.png`;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const platformRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isFalling, setIsFalling] = useState(false);
  const [lilaAtGap, setLilaAtGap] = useState(false);

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

  const centerGapInView = (gapIndex: number) => {
    const container = trackRef.current;
    if (!container) return;

    // platformRefs holds platform DOM nodes in order:
    // gapIndex sits BETWEEN platformRefs[gapIndex] and platformRefs[gapIndex + 1]
    const leftPlat = platformRefs.current[gapIndex];
    const rightPlat = platformRefs.current[gapIndex + 1];

    // If one of the platforms is missing fallback to centering nearest platform
    const cRect = container.getBoundingClientRect();
    const currentLeft = container.scrollLeft;

    try {
      if (leftPlat && rightPlat) {
        const lRect = leftPlat.getBoundingClientRect();
        const rRect = rightPlat.getBoundingClientRect();

        const midpoint =
          (lRect.left + lRect.width / 2 + (rRect.left + rRect.width / 2)) / 2;

        const offset = midpoint - cRect.left + currentLeft - cRect.width / 2;
        container.scrollTo({ left: offset, behavior: "smooth" });
      } else if (leftPlat) {
        // center left platform
        const eRect = leftPlat.getBoundingClientRect();
        const offset =
          eRect.left -
          cRect.left +
          currentLeft -
          (cRect.width / 2 - eRect.width / 2);
        container.scrollTo({ left: offset, behavior: "smooth" });
      } else if (rightPlat) {
        const eRect = rightPlat.getBoundingClientRect();
        const offset =
          eRect.left -
          cRect.left +
          currentLeft -
          (cRect.width / 2 - eRect.width / 2);
        container.scrollTo({ left: offset, behavior: "smooth" });
      }
    } catch (err) {
      // fallback: center current visible scroll
      container.scrollTo({ left: currentLeft, behavior: "smooth" });
    }
  };

  useEffect(() => {
    centerPlatformInView(lilaPlatformIndex);
  }, [lilaPlatformIndex, platforms.length]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (completedRef.current) return;
      completedRef.current = true;

      const finalResults = [...resultsRef.current];
      for (let i = currentQIndex; i < normalized.length; i++) {
        const s = normalized[i];
        finalResults.push({
          sentenceData: s,
          userAnswer: [],
          isCorrect: false,
          completedGaps: 0,
        });
      }
      onGameComplete({
        percentScore: computePercent(finalResults),
        rawPoints: score,
        results: finalResults,
      });
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, onGameComplete, normalized, currentQIndex, score]);

  useEffect(() => {
    completedRef.current = false;
  }, [normalized]);

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
    setLilaAtGap(false);
    setIsFalling(false);

    if (currentQIndex + 1 < normalized.length) {
      setCurrentQIndex((i) => i + 1);
    } else {
      if (completedRef.current) return;
      completedRef.current = true;
      const final = resultsRef.current;
      onGameComplete({
        percentScore: computePercent(final),
        rawPoints: score,
        results: [...final],
      });
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
      const answers = [
        ...filledGaps,
        { position: currentGap.position, mark, isCorrect: false },
      ];

      setFilledGaps(answers);
      setLilaState("sad");
      setStreak(0);
      setScore((s) => Math.max(0, s - 2));
      setTimeLeft((t) => Math.max(0, t - 3));

      // Move Lila to the gap (visual) and center it, then trigger fall
      setLilaAtGap(true);
      // ensure we center AFTER DOM updates
      requestAnimationFrame(() => centerGapInView(currentGapIndex));

      // Wait for Lila to move to gap, then trigger fall animation
      setTimeout(() => {
        setIsFalling(true);
        // hide the "standing at gap" image before/during the fall (optional)
        setLilaAtGap(false);

        setTimeout(() => {
          setIsFalling(false);

          const finalAnswers = [...answers];
          for (let i = currentGapIndex + 1; i < totalGaps; i++) {
            finalAnswers.push({
              position: gaps[i].position,
              mark: "",
              isCorrect: false,
            });
          }

          setCurrentGapIndex(totalGaps);
          finalizeSentence(finalAnswers, answers.length - filledGaps.length);
          setTimeout(goNext, 300);
        }, 800); // Duration of fall animation
      }, slideDur);
    }
  };

  const handleUseAssist = () => {
    if (assists <= 0 || !currentGap) return;

    setAssists((a) => a - 1);
    setShowAssistAnimation(true);
    setTimeout(() => setShowAssistAnimation(false), 500);

    // Auto-fill with correct answer
    const correctMark = currentGap.correctMark;
    const nextAnswers = [
      ...filledGaps,
      { position: currentGap.position, mark: correctMark, isCorrect: true },
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
  };

  const handleSkip = () => {
    const answers = [...filledGaps];

    for (let i = currentGapIndex; i < totalGaps; i++) {
      answers.push({
        position: gaps[i].position,
        mark: "",
        isCorrect: false,
      });
    }

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

    setStreak(0);
    setLilaState("worried");
    setScore((s) => Math.max(0, s - 5));
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

    const calculatePlatformWidth = (text: string, isEnd?: boolean): number => {
      if (isEnd) return 112;
      if (!text) return 112;

      const charWidth = 14;
      const minWidth = 80;
      const maxWidth = 400;
      const padding = 40;

      return Math.min(
        Math.max(text.length * charWidth + padding, minWidth),
        maxWidth
      );
    };

    return (
      <div
        ref={trackRef}
        className="w-full overflow-x-auto scrollbar-hide mx-5"
      >
        <LayoutGroup>
          <div className="inline-flex items-start justify-center gap-6 select-none relative min-w-full px-6">
            {platforms.map((unit, idx) => {
              if (unit.type === "platform") {
                const index = platformCounter++;
                const isLilaHere = index === lilaPlatformIndex && !lilaAtGap;

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

                    {unit.isEnd ? (
                      <img
                        src="/images/art/finish-platform.png"
                        alt="Finish Platform"
                        style={{
                          width: `200px`,
                          height: "auto",
                        }}
                        className="pointer-events-none select-none self-start mt-[-15%]"
                      />
                    ) : (
                      <MarioBridge
                        width={platformWidth}
                        height={16}
                        variant="platform"
                      />
                    )}

                    {unit.text && (
                      <div
                        className="mt-2 min-h-8 text-xl text-slate-700 font-semibold whitespace-pre-wrap text-center px-2"
                        style={{ maxWidth: `${platformWidth}px` }}
                      >
                        {unit.text}
                      </div>
                    )}
                  </div>
                );
              }

              const gapIndex = gapCounter++;
              const wasAnswered = gapIndex < filledGaps.length;
              const answered = filledGaps[gapIndex];
              const showing = wasAnswered ? answered?.mark : "";
              const isActive = gapIndex === currentGapIndex;
              const isCorrect = answered?.isCorrect || false;
              const isLilaAtGap = gapIndex === currentGapIndex && isFalling;

              return (
                <div key={`g-${idx}`} className="flex flex-col items-center">
                  <div className="h-28 flex items-end justify-center">
                    {/* Standing at gap BEFORE fall */}
                    {lilaAtGap && !isFalling && (
                      <motion.img
                        layoutId="lila"
                        src={lilaImage}
                        alt="Lila at gap"
                        initial={false}
                        transition={{
                          type: "tween",
                          ease: "easeInOut",
                          duration: 0.8,
                        }}
                        className="w-24 h-24 mb-2 pointer-events-none absolute"
                      />
                    )}

                    {/* Falling animation (only during the fall) */}
                    {isFalling && gapIndex === currentGapIndex && (
                      <motion.img
                        layoutId="lila"
                        src="/images/character/lila-sad.png"
                        alt="Lila falling"
                        initial={{ y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          y: [0, 10, 150],
                          opacity: [1, 1, 0],
                          scale: [1, 0.9, 0.5],
                          rotate: [0, -15, -30],
                        }}
                        transition={{
                          duration: 0.8,
                          ease: "easeIn",
                        }}
                        className="w-24 h-24 mb-2 pointer-events-none absolute"
                      />
                    )}
                  </div>

                  {wasAnswered && isCorrect ? (
                    <MarioBridge width={80} height={16} variant="gap" />
                  ) : (
                    <div className="h-4 w-20" />
                  )}

                  <div
                    className={`mt-2 h-10 w-12 rounded-lg border-2 flex items-center justify-center text-xl
                      ${
                        isActive
                          ? "border-purple-500 bg-purple-50"
                          : wasAnswered && isCorrect
                          ? "border-green-500 bg-green-50"
                          : wasAnswered
                          ? "border-red-500 bg-red-50"
                          : "border-slate-400 bg-slate-100"
                      }`}
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
            {/* Assists counter with animation */}
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full relative">
              <HandHelping className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {assists}
              </span>

              <AnimatePresence>
                {showAssistAnimation && (
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-none"
                    initial={{ opacity: 0, y: 0, scale: 1 }}
                    animate={{ opacity: [0, 1, 0], y: -20, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <HandHelping className="w-12 h-12 text-green-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-slate-500 text-lg font-mono whitespace-nowrap">
              {currentQIndex + 1} / {sentences.length}
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
                  className={`h-12 w-12 rounded-xl border-2 text-xl font-bold
                    ${
                      currentGap && currentGap.correctMark === m
                        ? "border-purple-500/60"
                        : "border-slate-400"
                    }
                    bg-slate-100 hover:bg-slate-200 active:scale-95 transition`}
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
            className="px-7 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-all duration-300 text-base"
          >
            SKIP
          </button>

          <button
            onClick={handleUseAssist}
            disabled={assists <= 0 || !currentGap}
            className="flex items-center gap-2 px-6 py-2 bg-purple-300 border-2 border-purple-400 hover:bg-purple-400 disabled:bg-slate-300 disabled:border-slate-400 disabled:cursor-not-allowed text-purple-950 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none"
          >
            <HandHelping className="w-5 h-5" />
            <span>Gamitin ang Assist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
