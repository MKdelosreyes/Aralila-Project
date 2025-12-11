import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type ChallengeOption = {
  id: number;
  text: string;
  imageSrc: string | null;
  audioSrc: string | null;
  correct: boolean;
};

type Challenge = {
  id: number;
  type: string;
  question: string;
  imagePrompt?: string;
  correctAnswer?: string;
  challengeOptions?: ChallengeOption[];
  words?: Array<{
    id: number;
    text?: string;
    word?: string;
    index?: number;
    correctTag?: string;
    correctPosition?: number;
  }>;
  punctuationMarks?: Array<{ id: number; mark: string; positions: number[] }>;
  posOptions?: Array<{ id: number; text: string; isCorrect: boolean }>;
};

type ChallengeProps = {
  challenge: Challenge;
  onSelect?: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  textAnswer?: string;
  onTextChange?: (text: string) => void;
  arrangedWords?: string[];
  onArrange?: (words: string[]) => void;
  selectedPunctuation?: Array<{ mark: string; position: number }>;
  onPunctuate?: (
    punctuation: Array<{ mark: string; position: number }>
  ) => void;
  taggedWords?: Record<number, string>;
  onTag?: (tagged: Record<number, string>) => void;
};

export const Challenge = ({
  challenge,
  onSelect,
  status,
  selectedOption,
  disabled,
  textAnswer,
  onTextChange,
  arrangedWords,
  onArrange,
  selectedPunctuation,
  onPunctuate,
  taggedWords,
  onTag,
}: ChallengeProps) => {
  // ✅ Move ALL useState hooks to the top (before any conditional returns)
  const [draggedMark, setDraggedMark] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);

  // 👇 SPELL type - Text input with image
  if (challenge.type === "SPELL") {
    return (
      <div className="flex flex-col gap-4">
        {challenge.imagePrompt && (
          <img
            src={challenge.imagePrompt}
            alt="Spell this"
            className="mx-auto max-h-[200px] rounded-lg mb-5"
          />
        )}
        <Input
          value={textAnswer}
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder="Type your answer here..."
          className="text-3xl font-semibold px-3 py-6"
          disabled={disabled}
        />
      </div>
    );
  }

  // 👇 ARRANGE type - Drag and drop words
  if (challenge.type === "ARRANGE") {
    const availableWords = challenge.words || [];

    return (
      <div className="flex flex-col gap-4">
        <div className="min-h-[100px] rounded-lg border-2 border-dashed border-sky-200 bg-neutral-50 p-4 flex flex-wrap gap-2">
          {arrangedWords?.map((word: string, index: number) => (
            <Button
              key={index}
              variant="secondary"
              onClick={() => {
                const newArranged = arrangedWords.filter((_, i) => i !== index);
                onArrange?.(newArranged);
              }}
              className="text-lg py-5 font-semibold border-2 border-b-3 border-sky-400 bg-sky-50"
            >
              {word}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {availableWords
            .filter((w: any) => !arrangedWords?.includes(w.text))
            .map((word: any) => (
              <Button
                key={word.id}
                onClick={() => {
                  onArrange?.([...(arrangedWords || []), word.text]);
                }}
                disabled={disabled}
                className="text-lg font-semibold py-5 border-2 border-b-3 border-purple-300 bg-purple-50 text-black hover:bg-sky-50"
              >
                {word.text}
              </Button>
            ))}
        </div>
      </div>
    );
  }

  // 👇 PUNCTUATE type - Click to add punctuation
  if (challenge.type === "PUNCTUATE") {
    const sentence: string = challenge.question || "";
    const words: string[] = sentence.split(" ");

    const allPositions: number[] = (challenge.punctuationMarks || [])
      .flatMap((pm: any) => (pm.positions as number[]) || [])
      .filter((p: number): p is number => typeof p === "number");

    const correctWordPositions: number[] = Array.from(
      new Set(allPositions)
    ).sort((a, b) => a - b);

    const availableMarks: string[] = [",", ".", "!", "?"];

    const nextGapWordIndex: number | undefined = correctWordPositions.find(
      (pos: number) => !selectedPunctuation?.some((p) => p.position === pos)
    );

    const handlePunctuationClick = (mark: string) => {
      if (typeof nextGapWordIndex !== "number" || disabled) return;

      const newPunctuation = [
        ...(selectedPunctuation || []),
        { mark, position: nextGapWordIndex },
      ];
      onPunctuate?.(newPunctuation);
    };

    const removePunctuation = (wordIndex: number) => {
      const newPunctuation =
        selectedPunctuation?.filter((p) => p.position !== wordIndex) || [];
      onPunctuate?.(newPunctuation);
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex text-xl p-6 bg-sky-50 rounded-lg border border-sky-300 min-h-[100px] mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {words.map((word, i) => {
              const hasGap = correctWordPositions.includes(i);
              const placedPunctuation = selectedPunctuation?.find(
                (p) => p.position === i
              );
              const isNextGap = nextGapWordIndex === i;

              return (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-neutral-900">{word}</span>

                  {hasGap && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[36px] h-[36px] rounded-md border-2 border-b-3 transition-all",
                        placedPunctuation
                          ? "border-green-500 bg-green-50 text-green-700"
                          : isNextGap
                          ? "border-purple-500 bg-purple-50 animate-pulse"
                          : "border-neutral-300 bg-white"
                      )}
                    >
                      {placedPunctuation ? (
                        <button
                          onClick={() => removePunctuation(i)}
                          className="text-lg font-bold px-2 hover:text-red-600 transition-colors"
                          disabled={disabled}
                          title="Click to remove"
                        >
                          {placedPunctuation.mark}
                        </button>
                      ) : isNextGap ? (
                        <span className="text-sm text-purple-400">?</span>
                      ) : (
                        <span className="text-xs text-neutral-300">_</span>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-base text-gray-400 font-medium text-center">
            Click a punctuation mark to fill the highlighted gap:
          </p>
          <div className="flex items-center justify-center gap-3">
            {availableMarks.map((mark) => (
              <button
                key={mark}
                onClick={() => handlePunctuationClick(mark)}
                disabled={disabled || typeof nextGapWordIndex !== "number"}
                className={cn(
                  "flex items-center justify-center px-5 py-2 text-xl font-bold rounded-xl border-2 border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 transition-all",
                  typeof nextGapWordIndex === "number" && !disabled
                    ? "bg-white border-purple-400 text-purple-600 hover:bg-purple-50 hover:scale-105 active:scale-95 shadow-md"
                    : "bg-neutral-100 border-neutral-300 text-neutral-400 cursor-not-allowed",
                  disabled && "opacity-50"
                )}
              >
                {mark}
              </button>
            ))}
          </div>

          {selectedPunctuation && selectedPunctuation.length > 0 && (
            <p className="text-sm text-neutral-500 text-center">
              💡 Click on placed punctuation to remove it
            </p>
          )}
        </div>
      </div>
    );
  }

  // 👇 TAG_POS type - Click words and tag them
  if (challenge.type === "TAG_POS") {
    const words = challenge.words || [];
    const posOptions = challenge.posOptions || [];

    const handleWordClick = (wordId: number) => {
      if (disabled) return;

      // If clicking already matched word, deselect it
      if (taggedWords?.[wordId]) {
        removeMatch(wordId);
        return;
      }

      // If this word is already selected, deselect it
      if (selectedWord === wordId) {
        setSelectedWord(null);
        return;
      }

      setSelectedWord(wordId);

      // If a POS is already selected, create the match
      if (selectedPos !== null) {
        const posText = posOptions.find((p: any) => p.id === selectedPos)?.text;
        if (posText) {
          onTag?.({ ...taggedWords, [wordId]: posText });
          setSelectedWord(null);
          setSelectedPos(null);
        }
      }
    };

    const handlePosClick = (posId: number, posText: string) => {
      if (disabled) return;

      // Check if this POS is already used in a match
      const matchedWordId = Object.entries(taggedWords || {}).find(
        ([_, tag]) => tag === posText
      )?.[0];

      // If clicking already matched POS, remove that match
      if (matchedWordId) {
        removeMatch(Number(matchedWordId));
        return;
      }

      // If this POS is already selected, deselect it
      if (selectedPos === posId) {
        setSelectedPos(null);
        return;
      }

      setSelectedPos(posId);

      // If a word is already selected, create the match
      if (selectedWord !== null) {
        onTag?.({ ...taggedWords, [selectedWord]: posText });
        setSelectedWord(null);
        setSelectedPos(null);
      }
    };

    const removeMatch = (wordId: number) => {
      const newTagged = { ...taggedWords };
      delete newTagged[wordId];
      onTag?.(newTagged);
      setSelectedWord(null);
      setSelectedPos(null);
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          {/* LEFT COLUMN: Words */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-neutral-700 mb-3">Words</p>
            {words.map((word: any) => {
              const isMatched = !!taggedWords?.[word.id];
              const isSelected = selectedWord === word.id;

              return (
                <button
                  key={word.id}
                  onClick={() => handleWordClick(word.id)}
                  disabled={disabled}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left font-medium transition-all",
                    isMatched
                      ? "bg-green-50 border-green-500 text-green-700"
                      : isSelected
                      ? "bg-purple-100 border-purple-500 text-purple-900 scale-105 shadow-lg"
                      : "bg-white border-neutral-300 hover:border-purple-300 hover:bg-purple-50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-lg">{word.word}</span>
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Parts of Speech */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-neutral-700 mb-3">
              Parts of Speech
            </p>
            {posOptions.map((pos: any) => {
              // Check if this POS is matched to any word
              const matchedWordId = Object.entries(taggedWords || {}).find(
                ([_, tag]) => tag === pos.text
              )?.[0];
              const isMatched = !!matchedWordId;
              const isSelected = selectedPos === pos.id;

              return (
                <button
                  key={pos.id}
                  onClick={() => handlePosClick(pos.id, pos.text)}
                  disabled={disabled}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-center font-medium transition-all",
                    isMatched
                      ? "bg-green-50 border-green-500 text-green-700"
                      : isSelected
                      ? "bg-purple-100 border-purple-500 text-purple-900 scale-105 shadow-lg"
                      : "bg-white border-neutral-300 hover:border-purple-300 hover:bg-purple-50",
                    disabled && "cursor-not-allowed"
                  )}
                >
                  {pos.text}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-center text-neutral-500">
          💡 Click a word, then click its part of speech to match them
        </p>
      </div>
    );
  }

  // 👇 COMPOSE type - Textarea
  if (challenge.type === "COMPOSE") {
    return (
      <Textarea
        value={textAnswer}
        onChange={(e) => onTextChange?.(e.target.value)}
        placeholder="Write your sentence here..."
        className="max-h-[100px] font-semibold"
        disabled={disabled}
      />
    );
  }

  // 👇 SELECT/ASSIST - existing code
  return (
    <div
      className={cn(
        "grid gap-2",
        challenge.type === "ASSIST" && "grid-cols-1",
        challenge.type === "SELECT" &&
          "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
      )}
    >
      {challenge.challengeOptions?.map((option: any, i: number) => (
        <Card
          key={option.id}
          id={option.id}
          text={option.text}
          imageSrc={option.imageSrc}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect?.(option.id)}
          status={status}
          audioSrc={option?.audioSrc}
          disabled={disabled}
          type={challenge.type}
        />
      ))}
    </div>
  );
};
