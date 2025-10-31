"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChallengeCard from "./challengecard";
import { env } from "@/lib/env";

const CARD_WIDTH = 352;
const CARD_GAP = 32;

interface Game {
  id: number;
  name: string;
  description: string;
  game_type: string;
  icon: string;
  best_score: number;
  completed: boolean;
}

interface CardCarouselProps {
  areaId: number;
  games?: Game[];
}

const CardCarousel = ({ areaId, games = [] }: CardCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  // Helper function to get valid image URL
  const getImageUrl = (icon: string | null | undefined): string => {
    if (!icon || icon.trim() === "") {
      return "/images/art/game-art-1.png";
    }

    if (icon.startsWith("http://") || icon.startsWith("https://")) {
      return icon;
    }

    if (icon.startsWith("/")) {
      return icon;
    }

    if (icon.includes("media/")) {
      return `${env.backendUrl}${icon.startsWith("/") ? "" : "/"}${icon}`;
    }

    return "/images/art/game-art-1.png";
  };

  // Map backend games to card format
  const cards = games.map((game) => ({
    id: game.id,
    title: game.name,
    slug: game.game_type,
    image: getImageUrl(game.icon),
    category: game.game_type,
    description: game.description,
    bestScore: game.best_score,
    completed: game.completed,
  }));

  console.log("Mapped cards:", cards);

  const nextCard = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  const prevCard = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const offset = window.innerWidth / 2 - CARD_WIDTH / 2;
    const targetX = -currentIndex * (CARD_WIDTH + CARD_GAP) + offset;
    const controls = animate(x, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
    return controls.stop;
  }, [currentIndex, x]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextCard,
    onSwipedRight: prevCard,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const homeLinkVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  };

  const homeLinkVariantsRight = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  if (cards.length === 0) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-screen w-full">
        <p className="text-white text-xl">No games available in this area</p>
      </div>
    );
  }

  return (
    <div
      className="relative z-10 flex items-center min-h-screen w-full bottom-12"
      {...swipeHandlers}
    >
      {/* Left and Right Fade Shadows */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />

      <div className="absolute left-4 z-20 ml-20">
        <AnimatePresence mode="wait">
          {currentIndex === 0 ? (
            <motion.div
              key="home-start"
              variants={homeLinkVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Link
                href="/student/dashboard"
                className="flex items-center gap-2 text-white/70 hover:text-white font-semibold uppercase text-xs tracking-wider transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>
          ) : (
            <motion.button
              key="prev"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevCard}
              className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-300 group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Cards */}
      <div className="w-full">
        <motion.div className="flex gap-8 items-center" style={{ x }}>
          {cards.map((card, index) => (
            <ChallengeCard
              key={card.id}
              card={card}
              isActive={index === currentIndex}
              areaId={areaId}
            />
          ))}
        </motion.div>
      </div>

      <div className="absolute right-4 z-20 mr-20">
        <AnimatePresence mode="wait">
          {currentIndex === cards.length - 1 ? (
            <motion.div
              key="home-end"
              variants={homeLinkVariantsRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Link
                href="/student/dashboard"
                className="flex items-center gap-2 text-white/70 hover:text-white font-semibold uppercase text-xs tracking-wider transition-colors"
              >
                Back to Home
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.button
              key="next"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextCard}
              className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-300 group"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-200" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardCarousel;
