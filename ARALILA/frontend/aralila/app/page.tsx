"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/navbar/navbar-home";
import { motion } from "framer-motion";
import { Github, Twitter, Mail } from "lucide-react"; 
import { Cinzel, Space_Grotesk } from "next/font/google";

// --- FONTS ---
const cinzel = Cinzel({ 
  subsets: ["latin"], 
  weight: ["400", "700", "900"] 
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500"] 
});

// --- FLOATING PARTICLES ---
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    size: Math.random() * 3 + 1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/80 blur-[1px] shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          initial={{ x: `${p.initialX}vw`, y: `${p.initialY}vh`, opacity: 0 }}
          animate={{
            y: [
              `${p.initialY}vh`,
              `${p.initialY - 15}vh`,
              `${p.initialY + 15}vh`,
            ],
            x: [
              `${p.initialX}vw`,
              `${p.initialX + 5}vw`,
              `${p.initialX - 5}vw`,
            ],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: p.size, height: p.size }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/student/challenges");
  };

  return (
    // h-screen + overflow-hidden makes it unscrollable
    <div className={`relative h-screen w-full overflow-hidden text-white selection:bg-purple-500 selection:text-white ${spaceGrotesk.className}`}>
      
      {/* --- BACKGROUND LAYERS --- */}
      {/* 1. The Forest Image */}
      <div className="absolute inset-0 z-[-3]">
        <Image
            src="/images/bg/bg-landing-2.png"
            alt="Forest Background"
            fill
            // object-center aligns the center of the image (the tree) with the center of the div
            className="object-cover object-center"
            priority
        />
      </div>

      {/* 2. Dark Gradient Overlay (Focus on center visibility) */}
      <div className="absolute inset-0 z-[-2] bg-gradient-to-b from-black/50 via-purple-950/10 to-black/80" />
      
      {/* 3. Vignette (Darkens edges to focus on the tree/portal) */}
      <div className="absolute inset-0 z-[-2] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* 4. Particles */}
      <FloatingParticles />

      {/* --- NAVBAR --- */}
      <div className="absolute top-0 w-full z-50">
        <Navbar />
      </div>

      {/* --- MAIN CONTENT (CENTERED) --- */}
      <main className="relative z-10 w-full h-full flex flex-col justify-center items-center px-6">
        
        {/* Grid layout ensuring Left/Right text are balanced around the center portal */}
        <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-3 items-center gap-4 lg:gap-12">
          
          {/* --- LEFT TEXT --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="hidden lg:block text-right pr-4 xl:pr-12 space-y-4"
          >
            <h1 className={`${cinzel.className} text-5xl xl:text-6xl font-bold leading-none drop-shadow-2xl`}>
              Master<br />
              <span className="text-purple-300">Filipino</span>
            </h1>
            <p className="text-purple-100/80 text-lg leading-relaxed max-w-sm ml-auto drop-shadow-md">
              Aralila turns language learning into a magical adventure. 
              Unlock the secrets of the forest.
            </p>
          </motion.div>

          {/* --- CENTER: THE PORTAL BUTTON --- */}
          <div className="flex flex-col items-center justify-center relative translate-y-45">
            
            {/* Mobile Title (Only visible on small screens) */}
            <div className="lg:hidden text-center mb-8 space-y-2 -translate-y-14">
                <h1 className={`${cinzel.className} text-4xl font-bold`}>Aralila</h1>
                <p className="text-sm text-purple-200">Master Filipino. The Fun Way.</p>
            </div>

            <motion.div
              onClick={handleStart}
              whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer group flex justify-center items-center"
            >
              {/* Glow effect behind portal */}
              <div className="absolute inset-0 bg-purple-600 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <Image
                src="/images/overlays/portal-purple-1.svg"
                alt="Start Adventure Portal"
                width={700}
                height={700}
                priority
                className="relative z-10 animate-[spin_12s_linear_infinite_reverse] w-[300px] md:w-[450px] lg:w-[600px] drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <span className={`${cinzel.className} text-xl md:text-2xl font-bold uppercase tracking-widest drop-shadow-lg bg-black/50 px-6 py-3 rounded-xl backdrop-blur-md border border-purple-500/30`}>
                  Click to Start
                </span>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT TEXT --- */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block text-left pl-4 xl:pl-12 space-y-4"
          >
            <h2 className={`${cinzel.className} text-4xl xl:text-5xl font-bold text-white drop-shadow-2xl`}>
              Enter the <br/>
              <span className="text-purple-300">Portal</span>
            </h2>
            <p className="text-purple-100/80 text-lg leading-relaxed max-w-sm drop-shadow-md">
              Step inside to start your journey. 
              Challenges, rewards, and ancient lore await.
            </p>
            
            <div className="pt-4 flex items-center gap-3 opacity-60">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                <span className="text-xs font-mono tracking-widest text-purple-200">REALM STATUS: ACTIVE</span>
            </div>
          </motion.div>

        </div>
      </main>

      {/* ---FOOTER --- */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-4 left-0 w-full z-20"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 font-mono gap-2">
            

            <span>© {new Date().getFullYear()} ARALILA. SYSTEM V.1.0</span>

            <div className="flex gap-4">
               <a href="#" className="hover:text-purple-400 transition-colors"><Github size={14} /></a>
               <a href="#" className="hover:text-purple-400 transition-colors"><Twitter size={14} /></a>
               <a href="#" className="hover:text-purple-400 transition-colors"><Mail size={14} /></a>
            </div>
        </div>
      </motion.footer>
    </div>
  );
}