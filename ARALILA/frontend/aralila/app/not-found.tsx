"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const MouseFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const particleId = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Create new particle
      const newParticle = {
        id: particleId.current++,
        x: e.clientX,
        y: e.clientY,
        life: 1,
      };
      
      setParticles(prev => [...prev.slice(-15), newParticle]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          life: particle.life - 0.02
        })).filter(particle => particle.life > 0)
      );
    }, 16);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 bg-purple-400 rounded-full"
          initial={{ 
            x: particle.x - 6, 
            y: particle.y - 6,
            scale: 0.8,
            opacity: 0.8
          }}
          animate={{
            scale: 0,
            opacity: 0,
            y: particle.y - 30
          }}
          transition={{
            duration: 1,
            ease: "easeOut"
          }}
          style={{
            boxShadow: `0 0 10px rgba(147, 51, 234, ${particle.life})`
          }}
        />
      ))}
    </div>
  );
};

const Particle = ({ delay = 0 }) => {
  const size = Math.random() * 8 + 4; // random size between 4px and 12px
  const x = Math.random() * 100; // random horizontal position
  const duration = Math.random() * 10 + 10; // 10–20s float duration

  return (
    <motion.div
      className="absolute bg-purple-400 rounded-full opacity-30"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: -20, // start just off-screen
      }}
      animate={{
        y: ["0%", "-150%"],
        opacity: [0.3, 0.6, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};


const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleArray = Array.from({ length: 50 }, (_, i) => (
      <Particle key={i} delay={Math.random() * 5} />
    ));
    setParticles(particleArray);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
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
          className="object-cover opacity-70"
        />
      </motion.div>

      {/* Dark purple overlay gradient */}
      <div className="min-h-screen absolute inset-0 bg-gradient-to-b from-purple-950/90 via-purple-900/70 to-black/90" />
      
      {/* Additional dark purple glow effects */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-700/15 rounded-full blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <AnimatedBackground />
      <MouseFollower />
      <FloatingParticles />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 drop-shadow-2xl"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200% 200%"
            }}
          >
            404
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-4"
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-wider uppercase">
              Page Not Found
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-600 to-purple-800 mx-auto rounded-full" />
          </motion.div>
        </motion.div>

        {/* Character Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            delay: 1,
            type: "spring",
            stiffness: 100
          }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              <Image
                src="/images/character/lila-oops.png"
                alt="Lila Oops Character"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
              
              {/* Glow effect around character */}
              <motion.div
                className="absolute inset-0 bg-purple-700/30 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Message and Button */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center max-w-md"
        >
          <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
            Oops! Looks like this page got lost in the forest. 
            Let&apos;s get you back on track!
          </p>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(88, 28, 135, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-purple-700/50"
            onClick={() => window.history.back()}
          >
            <motion.span
              animate={{
                textShadow: [
                  "0 0 0px rgba(255,255,255,0)",
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 0px rgba(255,255,255,0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              GO BACK
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Animated decorative elements */}
        <div className="absolute top-20 left-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-400 rounded-full"
          />
        </div>
        
        <div className="absolute bottom-20 right-20">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 bg-purple-600 transform rotate-45"
          />
        </div>

        <div className="absolute top-1/3 right-10">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-4 bg-purple-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;