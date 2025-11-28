"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/navbar/navbar-home";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Github, Mail } from "lucide-react"; // Optional icons

// --- FLOATING PARTICLES COMPONENT ---
const FloatingParticles = () => {
  // Generate random positions for particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    size: Math.random() * 6 + 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-500/60 blur-[1px]"
          initial={{ x: `${p.initialX}vw`, y: `${p.initialY}vh`, opacity: 0 }}
          animate={{
            y: [
              `${p.initialY}vh`,
              `${p.initialY - 20}vh`,
              `${p.initialY + 10}vh`,
            ],
            x: [
              `${p.initialX}vw`,
              `${p.initialX + 10}vw`,
              `${p.initialX - 10}vw`,
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
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <main className="relative flex-grow flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-[-2] bg-[url('/images/bg/bg-landing-2.png')] bg-no-repeat bg-center bg-cover opacity-80" 
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-black/40 via-transparent to-black/80" />

        {/* Floating Particles */}
        <FloatingParticles />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 items-center gap-8 h-full min-h-[80vh]">
          
          {/* --- LEFT TEXT (Intro) --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1 space-y-6"
          >
            <div className="backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/10 shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Master <span className="text-purple-400">Filipino</span>.<br />
                The Fun Way.
              </h1>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-md mx-auto lg:mx-0 mt-4">
                Aralila turns language learning into a magical adventure. 
                Explore folklore, solve puzzles, and level up your skills.
              </p>
            </div>
          </motion.div>

          {/* --- CENTER (Portal Button) --- */}
          <div className="order-1 lg:order-2 flex justify-center items-center py-10 lg:py-0">
            <motion.div
              onClick={handleStart}
              whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer group"
            >
              {/* Glow effect behind portal */}
              <div className="absolute inset-0 bg-purple-600 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <Image
                src="/images/overlays/portal-purple-1.svg"
                alt="Start Adventure Portal"
                width={650}
                height={650}
                priority
                className="relative z-10 animate-[spin_12s_linear_infinite_reverse] w-[280px] md:w-[450px] lg:w-[600px] drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              />
              
              {/* "Click to Enter" Tooltip/Text appearing on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <span className="text-2xl font-bold uppercase tracking-widest drop-shadow-lg bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md">
                  Click to Start
                </span>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT TEXT (Call to Action) --- */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-right order-3 space-y-6"
          >
            <div className="backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/10 shadow-2xl ml-auto max-w-md">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Enter the <span className="text-purple-400">Portal</span>
              </h2>
              <p className="text-gray-300 mb-6">
                Your journey awaits. Step inside to unlock challenges, 
                earn rewards, and discover the beauty of the Philippines.
              </p>
              <div className="hidden lg:block text-sm font-mono text-purple-300 opacity-70">
                &lt; System: Ready /&gt;
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-neutral-950 border-t border-white/5 text-neutral-400 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-wider">ARALILA</h3>
            <p className="text-sm leading-relaxed mb-4">
              Gamified Filipino learning for the modern student. 
              Bridging culture and technology.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Challenges</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Leaderboards</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Marketplace</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Teachers Guide</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Socials Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Connect</h4>
            <div className="flex gap-4">
              {/* Using lucide-react icons, or replace with simple spans if no icons installed */}
              <a href="#" className="bg-neutral-900 p-2 rounded-full hover:bg-purple-600 hover:text-white transition-all">
               <Github size={18} />
              </a>
              <a href="#" className="bg-neutral-900 p-2 rounded-full hover:bg-purple-600 hover:text-white transition-all">
               <Twitter size={18} />
              </a>
              <a href="#" className="bg-neutral-900 p-2 rounded-full hover:bg-purple-600 hover:text-white transition-all">
               <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Line */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} Aralila. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}