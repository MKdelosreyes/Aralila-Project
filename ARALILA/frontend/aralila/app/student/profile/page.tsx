'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  Star, 
  Zap, 
  Shield, 
  Gem, 
  ChevronRight,
  Swords,
  BookOpen,
  Sparkles
} from 'lucide-react';

// IMPORTANT: Ensure this path is correct in your project structure
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import Image from 'next/image';
// --- Types ---
interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface UserData {
  username: string;
  level: number;
  title: string;
  xp: number;
  maxXp: number;
  streak: number;
  gems: number;
  avatarUrl: string;
}

// --- Mock Data ---
const MOCK_USER: UserData = {
  username: "MysticWalker",
  level: 12,
  title: "Forest Explorer",
  xp: 2450,
  maxXp: 3000,
  streak: 14,
  gems: 1540,
  avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 1, title: "First Blood", desc: "Complete 1st Quest", icon: <Swords size={20} />, unlocked: true },
  { id: 2, title: "Mana Master", desc: "Collect 1000 Orbs", icon: <Zap size={20} />, unlocked: true },
  { id: 3, title: "Guardian", desc: "No damage taken", icon: <Shield size={20} />, unlocked: true },
  { id: 4, title: "Legendary", desc: "Reach Level 20", icon: <Trophy size={20} />, unlocked: false },
];

const TAGALOG_QUOTES = [
  "Kaya mo 'yan, kaibigan! Laban lang!",
  "Ang galing mo! Tuloy-tuloy lang!",
  "Huwag kang susuko, malayo pa ang mararating mo.",
  "Bawat hakbang, mahalaga. Padayon!",
  "Naniniwala ako sa kakayahan mo!",
  "Magpahinga kung pagod, pero 'wag hihinto.",
  "Isa kang lodi! Keep it up!",
];

const WORD_OF_THE_DAY = {
  word: "Hiraya",
  pronunciation: "/hi-ra-ya/",
  meaning: "Fruit of one's hopes, dreams, and aspirations.",
  example: "May hiraya manawari."
};

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<'stats' | 'badges'>('stats');
  const [quote, setQuote] = useState(TAGALOG_QUOTES[0]);
  const [fadeQuote, setFadeQuote] = useState(false);

  // XP Calculation
  const xpPercentage = (MOCK_USER.xp / MOCK_USER.maxXp) * 100;

  // Randomize Quote Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeQuote(true);
      setTimeout(() => {
        const randomQuote = TAGALOG_QUOTES[Math.floor(Math.random() * TAGALOG_QUOTES.length)];
        setQuote(randomQuote);
        setFadeQuote(false);
      }, 500); // Wait for fade out
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans flex items-center justify-center">
      
      {/* --- Background Layer --- */}
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
        {/* Overlay to ensure text readability if the BG is too bright */}
        <div className="absolute inset-0 bg-indigo-950/20 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col md:flex-row items-end md:items-center justify-between px-4 pb-0 md:pb-0">

        {/* --- LEFT SIDE: Lila & Speech Bubble --- */}
        <div className="hidden md:flex flex-1 h-full items-end justify-center relative pointer-events-none select-none">
          
          {/* Speech Bubble */}
          <div className={`absolute bottom-[65%] left-1/2 -translate-x-1/2 w-64 bg-white text-slate-900 p-6 rounded-3xl rounded-bl-none shadow-[0_0_20px_rgba(255,255,255,0.4)] transform transition-all duration-500 ease-in-out z-20 ${fadeQuote ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <p className="font-bold text-lg text-center leading-snug font-comic">
              "{quote}"
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-4 left-0 w-0 h-0 border-t-[20px] border-t-white border-r-[20px] border-r-transparent" />
          </div>

          {/* Lila Image */}
          {/* Using object-contain and object-bottom to make sure she stands on the 'floor' */}
          <Image
            src="/images/character/lila-normal.png"
            alt="Lila handa nang maglaro"
            width={600}
            height={600}
            className="mx-auto"
            priority
          />

        </div>

        {/* --- RIGHT SIDE: Profile Card --- */}
        <div className="flex-1 w-full flex items-center justify-center md:justify-start md:pl-10 h-full">
          <div className="w-full max-w-md animate-in slide-in-from-right-10 duration-700">
            
            {/* Glassmorphism Container */}
            <div className="backdrop-blur-xl bg-slate-900/70 border border-white/20 shadow-[0_0_50px_rgba(139,92,246,0.25)] rounded-3xl overflow-visible text-white p-6 pt-16 relative">
              
              {/* --- Avatar (Floating Top) --- */}
              <div className="absolute -top-12 left-8 w-24 h-24 group cursor-pointer">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-full h-full rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                    <img src={MOCK_USER.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-600 text-white font-bold text-xs w-8 h-8 flex items-center justify-center rounded-full border-2 border-slate-900 z-20">
                    {MOCK_USER.level}
                  </div>
                </div>
              </div>

              {/* --- Header & Title --- */}
              <div className="flex justify-between items-start mb-6 pl-24">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">{MOCK_USER.username}</h1>
                  <p className="text-cyan-300 font-medium text-xs tracking-wide uppercase flex items-center gap-1">
                    <Star size={12} className="fill-cyan-300" /> {MOCK_USER.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-white/10">
                   <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={16} />
                   <span className="text-orange-400 font-bold text-sm">{MOCK_USER.streak}</span>
                </div>
              </div>

               {/* --- WORD OF THE DAY SECTION --- */}
               <div className="mb-6 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
                  <div className="relative bg-slate-800/80 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400">
                       <BookOpen size={20} />
                    </div>
                    <div>
                       <div className="flex items-baseline gap-2">
                          <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Word of the Day</h3>
                          <span className="text-[10px] text-slate-400 italic">Tagalog</span>
                       </div>
                       <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-bold text-white">{WORD_OF_THE_DAY.word}</span>
                          <span className="text-xs text-slate-400 font-mono">{WORD_OF_THE_DAY.pronunciation}</span>
                       </div>
                       <p className="text-xs text-slate-300 mt-1 italic">"{WORD_OF_THE_DAY.meaning}"</p>
                    </div>
                  </div>
               </div>

              {/* --- Stats Cards --- */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3 flex flex-col justify-center items-center hover:bg-slate-800/80 transition-colors">
                    <span className="text-2xl font-bold text-cyan-400 flex items-center gap-1">
                       <Gem size={18} className="fill-cyan-400/20" /> {MOCK_USER.gems}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Gems</span>
                </div>
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3 flex flex-col justify-center items-center hover:bg-slate-800/80 transition-colors">
                    <span className="text-2xl font-bold text-purple-400 flex items-center gap-1">
                       <Trophy size={18} className="fill-purple-400/20" /> {MOCK_USER.level}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Current Lvl</span>
                </div>
              </div>

              {/* --- XP Progress --- */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold mb-1 text-purple-200 uppercase tracking-wider">
                  <span>XP Progress</span>
                  <span>{MOCK_USER.xp} / {MOCK_USER.maxXp}</span>
                </div>
                <div className="w-full h-4 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative transition-all duration-1000 ease-out"
                    style={{ width: `${xpPercentage}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-white/30" />
                  </div>
                </div>
              </div>

              {/* --- Tabs --- */}
              <div className="flex p-1 bg-slate-950/50 rounded-lg mb-4">
                {['stats', 'badges'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-300 capitalize ${
                      activeTab === tab 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* --- Tab Content --- */}
              <div className="min-h-[140px]">
                {activeTab === 'stats' ? (
                   <div className="bg-gradient-to-br from-violet-900/40 to-slate-900/40 border border-violet-500/20 rounded-xl p-4 relative overflow-hidden group hover:border-violet-500/40 transition-colors">
                     <div className="absolute -right-4 -bottom-4 text-violet-500/10 group-hover:text-violet-500/20 transition-colors">
                       <Sparkles size={100} />
                     </div>
                     <h3 className="text-sm font-bold text-white mb-1">Next Mission</h3>
                     <p className="text-xs text-purple-200 mb-3">Learn 5 new vocabulary words in the marketplace.</p>
                     
                     <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-bold text-xs text-white transition-all flex items-center justify-center gap-2">
                        Start <ChevronRight size={14} />
                     </button>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-right-4 duration-300">
                    {ACHIEVEMENTS.map((ach) => (
                      <div key={ach.id} className={`p-2 rounded-lg border flex flex-col items-center text-center gap-1 ${ach.unlocked ? 'bg-slate-800/60 border-purple-500/30' : 'bg-slate-900/40 border-slate-700/50 opacity-60 grayscale'}`}>
                        <div className={`p-1.5 rounded-full ${ach.unlocked ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700/30 text-slate-500'}`}>
                          {ach.icon}
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">{ach.title}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}