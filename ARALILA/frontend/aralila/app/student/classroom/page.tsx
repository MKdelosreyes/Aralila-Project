"use client";

import { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Image from "next/image";

type Word = {
  id: string;
  text: string;
  partOfSpeech: string; // "pangngalan" | "pandiwa" | "pang-abay"
};

type Question = {
  sentence: string;
  words: Word[];
};

const baskets = [
  { id: "pangngalan", label: "Pangngalan (Noun)" },
  { id: "pandiwa", label: "Pandiwa (Verb)" },
  { id: "pang-abay", label: "Pang-abay (Adverb)" },
];

const questions: Question[] = [
  {
    sentence: "The cat is eating the bread enthusiastically.",
    words: [
      { id: "cat", text: "cat", partOfSpeech: "pangngalan" },
      { id: "eating", text: "eating", partOfSpeech: "pandiwa" },
      {
        id: "enthusiastically",
        text: "enthusiastically",
        partOfSpeech: "pang-abay",
      },
    ],
  },
  {
    sentence: "The dog barked loudly at the stranger.",
    words: [
      { id: "dog", text: "dog", partOfSpeech: "pangngalan" },
      { id: "barked", text: "barked", partOfSpeech: "pandiwa" },
      { id: "loudly", text: "loudly", partOfSpeech: "pang-abay" },
    ],
  },
];

export default function SortingSentenceGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState<Word[]>(questions[0].words);
  const [score, setScore] = useState(0);
  const [lilaState, setLilaState] = useState<"normal" | "happy" | "sad">(
    "normal"
  );

  const currentQ = questions[currentIndex];

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (over) {
      const word = words.find((w) => w?.id === active.id); 
      if (word?.partOfSpeech === over.id) {
        setScore((s) => s + 10);
        setLilaState("happy");
        setWords((prev) => prev.filter((w) => w?.id !== word?.id)); // remove placed word
      } else {
        setScore((s) => Math.max(0, s - 5));
        setLilaState("sad");
      }
    }
  };

  // when all words are sorted, move to next question
  useEffect(() => {
    if (words.length === 0) {
      const timeout = setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
          setWords(questions[currentIndex + 1].words);
          setLilaState("normal");
        } else {
          alert(`Game finished! Final score: ${score}`);
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [words, currentIndex, score]);

  const renderSentence = () => {
    // Replace target words in sentence with draggable versions
    const sentenceParts = currentQ.sentence.split(" ");
    return sentenceParts.map((part, i) => {
      const word = words.find(
        (w) => w.text.toLowerCase() === part.toLowerCase().replace(/[.,]/g, "")
      );
      if (word) {
        return <DraggableWord key={word.id} word={word} />;
      }
      return (
        <span key={i} className="mx-1">
          {part}{" "}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <h1 className="text-2xl font-bold text-purple-700">
        I-drag ang salita sa tamang basket
      </h1>

      {/* Lila Character */}
      <Image
        src={`/images/character/lila-${lilaState}.png`}
        alt="Lila"
        width={120}
        height={120}
      />

      {/* Sentence with draggable words */}
      <DndContext onDragEnd={handleDragEnd}>
        <p className="text-xl text-slate-800 bg-slate-100 px-6 py-4 rounded-2xl shadow-md flex flex-wrap gap-1">
          {renderSentence()}
        </p>

        {/* Drop Zones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 w-full max-w-4xl">
          {baskets.map((basket) => (
            <DropZone key={basket.id} id={basket.id} label={basket.label} />
          ))}
        </div>
      </DndContext>

      {/* Score */}
      <p className="text-lg font-semibold mt-6">Score: {score}</p>
      <p className="text-slate-500">
        Sentence {currentIndex + 1} / {questions.length}
      </p>
    </div>
  );
}

// ========== Draggable Word ==========
function DraggableWord({ word }: { word?: Word }) {
  if (!word) return null;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: word.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="px-2 py-1 bg-purple-200 border-2 border-purple-400 
                 rounded-lg font-bold text-purple-800 cursor-grab inline-block"
    >
      {word.text}
    </span>
  );
}

// ========== Drop Zone (Basket) ==========
function DropZone({ id, label }: { id: string; label: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-6 rounded-2xl border-4 text-center font-semibold transition-colors
        ${
          isOver
            ? "bg-green-100 border-green-400"
            : "bg-slate-50 border-slate-300"
        }
      `}
    >
      🧺 {label}
    </div>
  );
}
