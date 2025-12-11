"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { HeartsDisplay } from "../ui/HeartDisplay";

type HeaderProps = {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
};

export default function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-between items-center">
      <a href="#" className="w-28 md:w-32">
        <Image
          src={
            menuOpen
              ? "/images/aralila-logo-exp-pr.svg"
              : "/images/aralila-logo-exp1.svg"
          }
          alt="Aralila Logo"
          width={128}
          height={32}
          priority
          className="transition-all duration-300"
        />
      </a>

      {!menuOpen && user && (
        <div className="flex items-center gap-4 md:gap-6">
          <HeartsDisplay />

          {/* User Info */}
          <div className="flex flex-row gap-2 items-center justify-center">
            <Avatar className="w-12 h-12 relative ring-2 ring-purple-500 shadow-[0_0_12px_3px_rgba(168,85,247,0.5)]">
              <AvatarImage
                alt="Student Avatar"
                className="object-cover"
                src={user.profile_pic}
              />
              <AvatarFallback className="bg-purple-900 text-white">
                {(user.first_name?.charAt(0) || "G") +
                  (user.last_name?.charAt(0) || "u")}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="font-semibold text-white">{user.full_name}</span>
              <span className="text-sm text-purple-400">{user.email}</span>
            </div>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1"
            aria-label="Open menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key="menu"
                initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-7 h-7 text-white" />
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      )}

      {menuOpen && (
        <button
          onClick={() => setMenuOpen(false)}
          className="p-1"
          aria-label="Close menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="x"
              initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7 text-purple-700" />
            </motion.div>
          </AnimatePresence>
        </button>
      )}
    </header>
  );
}
