"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { env } from "@/lib/env";
import Header from "@/components/student/header";
import FullMenuScreen from "@/components/student/fullscreen-menu";
import AnimatedBackground from "@/components/bg/animated-bg";
import CardCarousel from "@/components/student/challenges/cardcarousel";
import Image from "next/image";
import { Lock, TrendingUp } from "lucide-react";
import { useAreaUnlocks } from "@/hooks/useAreaUnlocks";
import { createClient } from "@/lib/supabase/client";

interface Area {
  id: number;
  name: string;
  description: string;
  order_index: number;
  completed_games: number;
  total_games: number;
  average_score: number;
}

interface Game {
  id: number;
  name: string;
  description: string;
  game_type: string;
  icon: string;
  best_score: number;
  completed: boolean;
}

interface UserData {
  first_name: string;
  last_name: string;
  profile_pic?: string;
  email?: string;
}

const areaSymbols = [
  {
    order_index: 0,
    name: "Playground",
    image: "/images/art/Playground-Area-Symbol.png",
    bgPath: "/images/bg/Playground.png",
  },
  {
    order_index: 1,
    name: "Classroom",
    image: "/images/art/Classroom-Area-Symbol.png",
    bgPath: "/images/bg/Classroom.png",
  },
  {
    order_index: 2,
    name: "Home",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Home.png",
  },
  {
    order_index: 3,
    name: "Town",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Town.png",
  },
  {
    order_index: 4,
    name: "Mountainside",
    image: "/images/art/Home-Area-Symbol.png",
    bgPath: "/images/bg/Mountainside.png",
  },
];

const areaStories = [
  {
    order_index: 0,
    titleFil: "Maligayang Pagdating sa Laruan!",
    titleEng: "Welcome to the Playground!",
    storyFil:
      "Dito nagsisimula ang iyong paglalakbay! Ang laruan ay puno ng masayang hamon na tutulong sa'yo matuto ng mga pangunahing kaalaman. Bawat laro na iyong tataposin ay maghahanda sa'yo para sa mas malalaking pakikipagsapalaran. Handa ka na bang maglaro at matuto?",
    storyEng:
      "This is where your journey begins! The playground is filled with fun challenges that will help you learn the basics. Every game you complete will prepare you for bigger adventures ahead. Are you ready to play and learn?",
    funFactFil:
      "Ang paglalaro ay tumutulong sa ating utak na lumaki at matuto nang mas mabilis!",
    funFactEng: "Playing helps our brain grow and learn faster!",
    icon: "🎮",
  },
  {
    order_index: 1,
    titleFil: "Oras na para sa Klase!",
    titleEng: "Time for Class!",
    storyFil:
      "Napakahusay! Ngayon ay oras na para dalhin ang iyong mga natutunang kasanayan sa silid-aralan. Dito, haharapin mo ang mas nakatuon na mga hamon na magpapatalas ng iyong isipan. Tandaan, bawat mahusay na mag-aaral ay nagsisimula sa pagkamausisa at pagsasanay!",
    storyEng:
      "Well done! Now it's time to take your skills to the classroom. Here, you'll face more focused challenges that will sharpen your mind. Remember, every great student starts with curiosity and practice!",
    funFactFil:
      "Ang pag-aaral nang may saya ay nakakatulong sa atin na tandaan ang mga bagay nang mas matagal!",
    funFactEng: "Learning with joy helps us remember things longer!",
    icon: "📚",
  },
  {
    order_index: 2,
    titleFil: "Pauwi na Tayo!",
    titleEng: "Back Home",
    storyFil:
      "Ang pag-aaral ay hindi nagtatapos sa labas ng silid-aralan! Sa bahay, matutuklasan mo kung paano gamitin ang iyong natutunan sa pang-araw-araw na sitwasyon. Ang mga hamong ito ay pamilyar ngunit kapana-panabik pa rin. Ipakita mo ang iyong natutuhan!",
    storyEng:
      "Learning doesn't stop outside the classroom! At home, you'll discover how to apply what you've learned in everyday situations. These challenges will feel familiar yet exciting. Show what you've learned!",
    funFactFil:
      "Ang mga natutunan natin sa tahanan ay nananatili sa atin habambuhay!",
    funFactEng: "What we learn at home stays with us for life!",
    icon: "🏠",
  },
  {
    order_index: 3,
    titleFil: "Tuklasin ang Bayan!",
    titleEng: "Explore the Town!",
    storyFil:
      "Ang bayan ay puno ng aktibidad! Lubhang lumaki ka na, at ngayon ay oras na para subukan ang iyong mga kasanayan sa mas malawak na komunidad. Makilala ang mga bagong hamon, tumulong sa mga kapitbahay, at patunayan na handa ka na para sa mas dakilang pakikipagsapalaran!",
    storyEng:
      "The town is buzzing with activity! You've grown so much, and now it's time to test your skills in the wider community. Meet new challenges, help neighbors, and prove you're ready for even greater adventures!",
    funFactFil:
      "Ang pagtulong sa iba ay nagpapalakas din ng ating sariling kaalaman!",
    funFactEng: "Helping others also strengthens our own knowledge!",
    icon: "🏘️",
  },
  {
    order_index: 4,
    titleFil: "Abutin ang Rurok!",
    titleEng: "Reach New Heights!",
    storyFil:
      "Nakarating ka sa Bundok - ang pinakamataas na hamon! Tanging ang pinaka-dedikadong mag-aaral lamang ang nakakaabot dito. Ang mga hamon dito ay mahirap, ngunit napatunayan mo na may kakayahan ka. Umakyat nang mas mataas at maging tunay na dalubhasa!",
    storyEng:
      "You've made it to the Mountainside - the ultimate test! Only the most dedicated learners reach this far. The challenges here are tough, but you've proven you have what it takes. Climb higher and become a true master!",
    funFactFil:
      "Ang mga pinakamahirap na hamon ay nagdudulot ng pinakamasayang tagumpay!",
    funFactEng: "The toughest challenges bring the sweetest victories!",
    icon: "⛰️",
  },
];

export default function ChallengesPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading challenges...</p>
          </div>
        </div>
      }
    >
      <ChallengesPageInner />
    </Suspense>
  );
}

function ChallengesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaParam = searchParams.get("area");

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAreaOrder, setSelectedAreaOrder] = useState<number>(
    areaParam ? parseInt(areaParam) : 0
  );
  const [areaData, setAreaData] = useState<Area | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const supabase = createClient();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [useEnglish, setUseEnglish] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const {
    isAreaLocked,
    getAreaProgress,
    loading: progressLoading,
  } = useAreaUnlocks();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkShadows = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      setShowTopShadow(scrollTop > 0);
      setShowBottomShadow(scrollTop + clientHeight < scrollHeight);
    };
    const t = setTimeout(checkShadows, 10);

    el.addEventListener("scroll", checkShadows);
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", checkShadows);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let token = session?.access_token || localStorage.getItem("access_token");

      if (session?.access_token) {
        localStorage.setItem("access_token", session.access_token);
        if (session.refresh_token) {
          localStorage.setItem("refresh_token", session.refresh_token);
        }
      }

      if (!token) {
        console.log("No token found, redirecting to login");
        router.push("/login");
        return;
      }

      if (isAreaLocked(selectedAreaOrder)) {
        const firstUnlocked = areaSymbols.find(
          (a) => !isAreaLocked(a.order_index)
        );
        if (firstUnlocked) {
          setSelectedAreaOrder(firstUnlocked.order_index);
        }
      } else {
        fetchAreaData(selectedAreaOrder);
      }
    })();
  }, [selectedAreaOrder]);

  const fetchAreaData = async (orderIndex: number) => {
    if (isAreaLocked(orderIndex)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `${env.backendUrl}/api/games/area/order/${orderIndex}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch area data: ${response.status}`);
      }

      const data = await response.json();
      console.log("Area data fetched:", data);
      setAreaData(data.area);
      setGames(data.games);
    } catch (error) {
      console.error("Failed to fetch area data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = (orderIndex: number) => {
    if (isAreaLocked(orderIndex)) {
      return;
    }
    setSelectedAreaOrder(orderIndex);
    setShowPopup(true);
  };

  useEffect(() => {
    if (!progressLoading && !loading) {
      setShowPopup(true);
    }
  }, [selectedAreaOrder, progressLoading, loading]);

  const getBackgroundComponent = () => {
    const selectedArea = areaSymbols.find(
      (a) => a.order_index === selectedAreaOrder
    );
    if (selectedArea?.bgPath) {
      return <AnimatedBackground imagePath={selectedArea.bgPath} />;
    }
    return <AnimatedBackground imagePath="/images/bg/forestbg-learn.jpg" />;
  };

  const currentStory = areaStories.find(
    (s) => s.order_index === selectedAreaOrder
  );
  const progress = getAreaProgress(selectedAreaOrder);
  const progressPercentage = areaData
    ? Math.round((areaData.completed_games / areaData.total_games) * 100)
    : 0;

  const getPopupContainer = () => {
    if (selectedAreaOrder === 0) {
      return "/images/bg/palaruan-popup-container.png";
    } else if (selectedAreaOrder === 1) {
      return "/images/bg/paaralan-popup-container.png";
    } else if (selectedAreaOrder === 2) {
      return "/images/bg/bahay-popup-container.png";
    } else if (selectedAreaOrder === 3) {
      return "/images/bg/pamilihan-popup-container.png";
    } else {
      return "/images/bg/kabundukan-popup-container.png";
    }
  };

  const getPopupContent = () => {
    if (selectedAreaOrder === 0) {
      if (useEnglish) {
        return "/images/bg/palaruan-graphics-us.png";
      }
      return "/images/bg/palaruan-graphics-ph.png";
    } else if (selectedAreaOrder === 1) {
      if (useEnglish) {
        return "/images/bg/paaralan-graphics-us.png";
      }
      return "/images/bg/paaralan-graphics-ph.png";
    } else if (selectedAreaOrder === 2) {
      if (useEnglish) {
        return "/images/bg/bahay-graphics-us.png";
      }
      return "/images/bg/bahay-graphics-ph.png";
    } else if (selectedAreaOrder === 3) {
      if (useEnglish) {
        return "/images/bg/pamilihan-graphics-us.png";
      }
      return "/images/bg/pamilihan-graphics-ph.png";
    } else {
      if (useEnglish) {
        return "/images/bg/kabundukan-graphics-us.png";
      }
      return "/images/bg/kabundukan-graphics-ph.png";
    }
  };

  if (progressLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  console.log("Games length for area ", selectedAreaOrder, ":", games.length);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <AnimatePresence>
        {showPopup && currentStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/0 backdrop-blur-xs"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-[60%] h-[78%] min-w-[60%] mx-4 rounded-2xl"
              style={{
                backgroundImage: `url('${getPopupContainer()}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative z-10 flex flex-row ml-[66%] mt-[-3%] items-center">
                <Image
                  src={"/images/character/lila-happy.png"}
                  alt="Lila Happy"
                  width={200}
                  height={200}
                  // style={{ marginLeft: "70%", marginTop: "-3%" }}
                ></Image>

                {/* Language Toggle */}
                <button
                  onClick={() => setUseEnglish(!useEnglish)}
                  className="relative mt-[20%] ml-[-5%] px-3 py-1 border-2 border-purple-600 text-purple-950 hover:bg-purple-200 hover:text-black rounded-lg text-xs font-bold transition-colors"
                >
                  {useEnglish ? "🇵🇭 Filipino" : "🇺🇸 English"}
                </button>
              </div>

              <div
                ref={scrollRef}
                className="relative w-[90%] max-h-[71%] mt-[-5%] mx-[50px] overflow-y-auto overflow-x-hidden scrollbar-purple rounded-2xl"
              >
                {/* Top Fade Shadow */}
                {/* {showTopShadow && (
                  <div
                    className="pointer-events-none absolute top-0 left-0 w-full h-6 
                        bg-gradient-to-b from-[rgba(159,89,223,0.25)] to-transparent z-10"
                  />
                )} */}

                {/* Bottom Fade Shadow */}
                {/* {showBottomShadow && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-6 
                        bg-gradient-to-t from-[rgba(159,89,223,0.25)] to-transparent z-10"
                  />
                )} */}

                <div className="relative w-auto min-h-[400px]">
                  <Image
                    src={getPopupContent()}
                    alt="Playground illustration"
                    width={2000}
                    height={1200}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullMenuScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedAreaOrder}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {getBackgroundComponent()}
        </motion.div>
      </AnimatePresence>

      {/* Game Cards Carousel */}
      {loading ? (
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <p className="text-white text-xl">Loading games...</p>
        </div>
      ) : (
        <CardCarousel areaId={selectedAreaOrder} games={games} />
      )}

      {/* Area Selection Symbols at Bottom */}
      <div className="flex flex-row gap-3 md:gap-5 absolute bottom-0 left-0 right-0 z-[10] p-4 md:p-6 w-full items-center justify-center">
        {areaSymbols.map((area) => {
          const locked = isAreaLocked(area.order_index);
          const isSelected = selectedAreaOrder === area.order_index;

          return (
            <motion.div key={area.order_index} className="relative">
              <motion.button
                onClick={() => handleAreaClick(area.order_index)}
                disabled={locked}
                whileHover={!locked ? { scale: 1.1 } : {}}
                whileTap={!locked ? { scale: 0.95 } : {}}
                className={`relative transition-all duration-300 ${
                  locked
                    ? "opacity-30 cursor-not-allowed grayscale"
                    : isSelected
                    ? "opacity-100 scale-110"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <Image
                  src={area.image}
                  alt={`${area.name} Symbol`}
                  width={180}
                  height={180}
                  className="mt-[-100px] drop-shadow-2xl"
                />

                {/* Lock Overlay */}
                {locked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 border-2 border-white/20">
                      <Lock className="text-white drop-shadow-lg" size={32} />
                    </div>
                  </motion.div>
                )}

                {/* Active Indicator */}
                {isSelected && !locked && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Lock Label */}
              {locked && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
                >
                  Complete previous area
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
