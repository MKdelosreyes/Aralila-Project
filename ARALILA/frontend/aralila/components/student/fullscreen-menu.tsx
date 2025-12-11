"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useRouter } from "next/navigation";

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
    transition: { y: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: { y: { stiffness: 1000 } },
  },
};

interface FullscreenMenuProps {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
}

const FullscreenMenu: React.FC<FullscreenMenuProps> = ({
  menuOpen,
  setMenuOpen,
}) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setMenuOpen(false);
    router.push("/");
  };

  return (
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
              <motion.a
                variants={menuItemVariants}
                href="/student/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 hover:text-purple-700 font-bold text-5xl"
              >
                Home
              </motion.a>
              <motion.a
                variants={menuItemVariants}
                href="/student/challenges"
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 hover:text-purple-700 font-bold text-5xl"
              >
                Challenges
              </motion.a>
              <motion.a
                variants={menuItemVariants}
                href="/student/playground"
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 hover:text-purple-700 font-bold text-5xl"
              >
                Playground
              </motion.a>
              <motion.a
                variants={menuItemVariants}
                href="/student/profile"
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 hover:text-purple-700 font-bold text-5xl"
              >
                Profile
              </motion.a>
              <motion.button
                variants={menuItemVariants}
                onClick={handleLogout}
                className="text-purple-700 hover:text-slate-700 font-bold text-5xl text-left"
              >
                Logout
              </motion.button>
              {/* <motion.a variants={menuItemVariants} href="/student/learn" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-purple-700 font-bold text-5xl">Learn</motion.a> */}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenMenu;
