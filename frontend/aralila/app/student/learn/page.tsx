"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const CardCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  // Raw mouse movement
  const pointerX = useRef(0);
  const smoothedPointerX = useMotionValue(0);

  // Idle drift motion
  const idleX = useMotionValue(0);

  const cards = [
    // Enhancing Writing Mechanics in Filipino
    {
      id: 1,
      title: "Spelling Challenge",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Punctuation Task",
      image:
        "https://images.unsplash.com/photo-1464822759844-d150baec843a?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: " Parts of Speech Challenge",
      image:
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
    },
    // Expanding Filipino Language Proficiency through Vocabulary Development
    {
      id: 4,
      title: "Word Association Game",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: "Word Matching Activity",
      image:
        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop",
    },
    // Grammar Accuracy in Filipino Writing
    {
      id: 6,
      title: "Grammar Check Game",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    },
    // Sentence Construction Mastery
    {
      id: 7,
      title: "Sentence Construction Challenge",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    },
    {
      id: 8,
      title: "Emoji Sentence Challenge",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    },
  ];

  const CARD_WIDTH = 352;

  const nextCard = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  const prevCard = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const targetX = -currentIndex * CARD_WIDTH + 96;
    const controls = animate(x, targetX, {
      duration: 0.6,
      ease: [0.25, 1, 0.5, 1],
    });
    return controls.stop;
  }, [currentIndex]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextCard,
    onSwipedRight: prevCard,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Smooth parallax logic
  useEffect(() => {
    const animateSmooth = () => {
      const current = smoothedPointerX.get();
      const next = current + (pointerX.current - current) * 0.05;
      smoothedPointerX.set(next);
      requestAnimationFrame(animateSmooth);
    };
    animateSmooth();
  }, [smoothedPointerX]);

  // Idle background drifting
  useEffect(() => {
    const controls = animate(idleX, 50, {
      duration: 10,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [idleX]);

  // Combine both: idle + pointer
  const combinedX = useTransform(
    [idleX, smoothedPointerX],
    ([idle, pointer]) => idle + pointer
  );

  const handlePointerMove = (e: React.PointerEvent) => {
    const percent = e.clientX / window.innerWidth;
    pointerX.current = (percent - 0.5) * 50; // range -25 to +25
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* 🌲 Background with idle + pointer parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ x: combinedX }}>
        <Image
          src="/images/forestbg-learn.jpg"
          alt="Forest Background"
          fill
          priority
          className="object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* 🎯 Foreground content */}
      <div
        className="relative z-10 flex items-center justify-center min-h-screen w-full px-12 bg-black/30 backdrop-blur-[3px]"
        {...swipeHandlers}
      >
        {/* ⬅️ Left Arrow */}
        <div className="absolute left-4 z-10">
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

        {/* 📸 Card Carousel */}
        <div className="w-full max-w-[100vw] overflow-visible">
          <motion.div
            className="flex gap-8 items-center justify-start"
            style={{ x }}
          >
            {cards.map((card, index) => {
              const isActive = index === currentIndex;
              const scale = isActive ? 1.1 : 0.85;

              const glowColor =
                "shadow-[0_0_50px_5px_rgba(168,85,247,0.25)] border-purple-300";

              return (
                <div
                  key={card.id}
                  className="flex items-center justify-center w-[352px] h-[30rem] flex-shrink-0"
                >
                  <motion.div
                    layout
                    animate={{ scale }}
                    whileHover={isActive ? { scale: 1.15 } : {}}
                    transition={{
                      duration: 0.4,
                      ease: [0.25, 1, 0.5, 1],
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={`w-full h-full relative rounded-3xl overflow-hidden group 
    backdrop-blur-2xl bg-white/[0.02] border-0
    before:absolute before:inset-0 before:rounded-3xl before:p-[1px]
    before:bg-gradient-to-br before:from-white/40 before:via-white/10 before:to-transparent
    before:mask-composite:xor before:[mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]
    after:absolute after:inset-[1px] after:rounded-3xl after:opacity-60
    hover:before:from-white/60 hover:after:opacity-80
    transition-all duration-700 ease-out
    ${glowColor}`}
                    style={{
                      background: `
      radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
      linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)
    `,
                      boxShadow: `
      0 1px 0 0 rgba(255,255,255,0.8) inset,
      0 -1px 0 0 rgba(255,255,255,0.2) inset,
      0 1px 3px 0 rgba(0,0,0,0.1),
      0 4px 20px 0 rgba(0,0,0,0.05),
      0 1px 0 0 rgba(255,255,255,0.9)
    `,
                      backdropFilter: "blur(40px) saturate(180%)",
                      WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    }}
                  >
                    {/* Card Image */}
                    <div className="p-4 pt-6">
                      <div className="relative w-full h-56 rounded-xl overflow-hidden">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex items-center justify-between text-white">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                        <p className="text-xs opacity-80">
                          Card {index + 1} of {cards.length}
                        </p>
                      </div>

                      {isActive && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Play
                            className="w-4 h-4 ml-0.5"
                            fill="currentColor"
                          />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ➡️ Right Arrow */}
        <div className="absolute right-4 z-10">
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
