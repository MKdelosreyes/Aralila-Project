"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Menu, X } from "lucide-react";

// Variants for the menu animation
const menuContainerVariants = {
  open: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const menuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const CardCarousel = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  // ✨ UPDATED cards data with categories
  const cards = [
    {
      id: 1,
      title: "Spell Mo 'Yan",
      image: "/images/art/game-art-1.png",
      category: "Spelling",
      description: "Subukan ang bilis mo sa paghahanap at pagtatama ng maling baybay ng mga salita sa pangungusap.",
    },
    {
      id: 2,
      title: "Puntuhang Puntos",
      image: "/images/art/game-art-2.png",
      category: "Punctuation",
      description: "Ilagay ang tamang bantas (tulad ng tuldok o kuwit) sa mga pangungusap para makakuha ng puntos.",
    },
    {
      id: 3,
      title: "Salita't Uri",
      image: "/images/art/game-art-3.png",
      category: "Parts of Speech",
      description: "Kilalanin at uriin ang mga salita (kung ito ay pangngalan, pandiwa, atbp.) sa loob ng pangungusap.",
    },
    {
      id: 4,
      title: "Salitang Konektado",
      image: "/images/art/game-art-4.png",
      category: "Word Association",
      description: "Hulaan ang salita na nagkokonekta sa mga ibinigay na pahiwatig o larawan.",
    },
    {
      id: 5,
      title: "Tugmahan Tayo",
      image: "/images/art/game-art-5.png",
      category: "Word Matching",
      description: "Itugma ang mga salita sa kanilang kahulugan o tamang gamit sa mga pangungusap.",
    },
    {
      id: 6,
      title: "Gramatika Galore",
      image: "/images/art/game-art-6.png",
      category: "Grammar",
      description: "Hanapin at itama ang mga mali sa mga pangungusap para maging perpekto ang gramatika.",
    },
    {
      id: 7,
      title: "Ayusin ang Pangungusap",
      image: "/images/art/game-art-7.png",
      category: "Sentence Structure",
      description: "Ayusin ang mga nagulong salita para makabuo ng tama at buong pangungusap.",
    },
    {
      id: 8,
      title: "Kwento ng mga Emoji",
      image: "/images/art/game-art-8.png",
      category: "Comprehension",
      description: "Hulaan kung anong pangungusap o parirala ang ibig sabihin ng mga emoji, at buuin ito sa Filipino!",
    },
  ];

  const CARD_WIDTH = 352;
  const CARD_GAP = 32;

  const nextCard = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  const prevCard = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const containerWidth = window.innerWidth;
    const offset = containerWidth / 2 - CARD_WIDTH / 2;
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-between items-center">
        <a href="#" className="w-28 md:w-32">
          <Image
            src={menuOpen ? "/images/aralila-logo-exp-pr.svg" : "/images/aralila-logo-exp1.svg"}
            alt="Aralila Logo"
            width={128}
            height={32}
            priority
            className="transition-all duration-300"
          />
        </a>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={menuOpen ? "x" : "menu"}
              initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              {menuOpen ? (
                <X className="w-7 h-7 text-purple-700" />
              ) : (
                <Menu className="w-7 h-7 text-white" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </header>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100vh" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-white overflow-hidden"
          >
            <motion.div
              className="flex h-full w-full items-center justify-center"
              variants={menuContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <nav className="flex flex-col items-start gap-8">
                <motion.a variants={menuItemVariants} href="dashboard" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-purple-700 font-bold text-5xl">Home</motion.a>
                <motion.a variants={menuItemVariants} href="#learn" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-purple-700 font-bold text-5xl">Learn</motion.a>
                <motion.a variants={menuItemVariants} href="playground" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-purple-700 font-bold text-5xl">Playground</motion.a>
                <motion.a variants={menuItemVariants} href="#" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-purple-700 font-bold text-5xl">Profile</motion.a>
                <motion.a variants={menuItemVariants} href="#" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-purple-700 font-bold text-5xl">Settings</motion.a>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-[-5%] w-[110%] h-[110%]"
          animate={{ x: ["0%", "-5%", "0%"], y: ["0%", "2%", "0%"] }}
          transition={{
            duration: 45,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          <Image
            src="/images/bg/forestbg-learn.jpg"
            alt="Forest Background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent" />
      </div>

      {/* Foreground */}
      <div className="relative z-10 flex items-center min-h-screen w-full" {...swipeHandlers}>
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />

        <div className="absolute left-4 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </motion.button>
        </div>

        <div className="w-full">
          <motion.div className="flex gap-8 items-center" style={{ x }}>
            {cards.map((card, index) => {
              const isActive = index === currentIndex;
              const scale = isActive ? 1.05 : 0.75;
              const opacity = isActive ? 1 : 0.3;

              return (
                <div key={card.id} className="w-[352px] h-[32rem] flex-shrink-0" aria-hidden={!isActive}>
                  {/* ✨ FIXED CARD LAYOUT ✨ */}
                  <motion.div
                    animate={{ scale, opacity }}
                    whileHover={isActive ? { scale: 1.1 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    // Add the conditional shadow here:
                    className={`w-full h-full rounded-[2rem] bg-white overflow-hidden flex flex-col transition-shadow duration-500 ${
                      isActive 
                        ? "shadow-[0px_0px_30px_-5px_rgba(168,85,247,0.4)] shadow-[0_0_20px_5px_rgba(192,132,252,0.5)]" // Light purple glow added here
                        : "shadow-xl"
                    }`}
                  >
                    {/* Card Image - Bigger and more prominent */}
                    <div className="relative w-full h-56 flex-shrink-0 p-3 pb-0">
                      <div className="w-full h-full rounded-[1.2rem] overflow-hidden relative shadow-lg">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          priority={isActive}
                          quality={100}
                          sizes="352px"
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    
                    {/* Card Content - Tighter spacing for more image prominence */}
                    <div className="flex flex-col flex-grow p-5 pt-3">
                      {/* Content section - takes available space */}
                      <div className="flex-grow">
                        <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                          {card.category}
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4"> {/* Added mb-4 here */}
                          {card.description}
                        </p>
                      </div>

                      {/* Button section - Fixed at bottom with proper spacing */}
                      {isActive && (
                        <div className="mt-5 pt-3 border-t border-gray-100">
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-base flex items-center justify-center gap-2
                                       shadow-[0_4px_15px_rgba(168,85,247,0.3)]
                                       hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-200
                                       active:scale-[0.98]"
                          >
                            <Play className="w-4 h-4" fill="currentColor" />
                            Start Challenge
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="absolute right-4 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextCard}
            disabled={currentIndex === cards.length - 1}
            className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-200" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CardCarousel;