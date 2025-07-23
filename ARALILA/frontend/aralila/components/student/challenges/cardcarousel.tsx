"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChallengeCard from "./challengecard";

const cards = [
  { id: 1,
    title: "Spell Mo 'Yan",
    slug: "spelling-challenge",
    image: "/images/art/game-art-1.png",
    category: "Spelling",
    description: "Subukan ang bilis mo sa paghahanap at pagtatama ng maling baybay ng mga salita sa pangungusap."
  },
  { id: 2,
    title: "Puntuhang Puntos",
    slug: "punctuation-task",
    image: "/images/art/game-art-2.png",
    category: "Punctuation",
    description: "Ilagay ang tamang bantas (tuldok o kuwit) sa mga pangungusap para makakuha ng puntos."
  },
  { id: 3,
    title: "Salita't Uri",
    slug: "parts-of-speech",
    image: "/images/art/game-art-3.png",
    category: "Parts of Speech",
    description: "Kilalanin at uriin ang mga salita (pangngalan, pandiwa, at iba pa.) sa loob ng pangungusap."
  },
  { id: 4,
    title: "Salitang Konektado",
    slug: "word-association",
    image: "/images/art/game-art-4.png",
    category: "Word Association",
    description: "Hulaan ang salita na nagkokonekta sa mga ibinigay na pahiwatig o larawan."
  },
  { id: 5,
    title: "Tugmahan Tayo",
    slug: "word-matching",
    image: "/images/art/game-art-5.png",
    category: "Word Matching",
    description: "Itugma ang mga salita sa kanilang kahulugan o tamang gamit sa mga pangungusap."
  },
  { id: 6,
    title: "Gramatika Galore",
    slug: "grammar-check",
    image: "/images/art/game-art-6.png",
    category: "Grammar",
    description: "Hanapin at itama ang mga mali sa mga pangungusap para maging perpekto ang gramatika."
  },
  { id: 7,
    title: "Ayusin ang Pangungusap",
    slug: "sentence-construction",
    image: "/images/art/game-art-7.png",
    category: "Sentence Structure",
    description: "Ayusin ang mga nagulong salita para makabuo ng tama at buong pangungusap."
  },
  { id: 8,
    title: "Kwento ng mga Emoji",
    slug: "emoji-sentence",
    image: "/images/art/game-art-8.png",
    category: "Comprehension",
    description: "Hulaan kung anong pangungusap ang ibig sabihin ng mga emoji, at buuin ito sa Filipino!"
  },
];

const CARD_WIDTH = 352;
const CARD_GAP = 32;

const CardCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  const nextCard = () => setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  const prevCard = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const offset = window.innerWidth / 2 - CARD_WIDTH / 2;
    const targetX = -currentIndex * (CARD_WIDTH + CARD_GAP) + offset;
    const controls = animate(x, targetX, { type: "spring", stiffness: 300, damping: 30 });
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

  return (
    <div className="relative z-10 flex items-center min-h-screen w-full" {...swipeHandlers}>
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
                <Link href="/student/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white font-semibold uppercase text-xs tracking-wider transition-colors">
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
            <ChallengeCard key={card.id} card={card} isActive={index === currentIndex} />
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
                <Link href="/student/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white font-semibold uppercase text-xs tracking-wider transition-colors">
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
