// components/student/Header.tsx
"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type HeaderProps = {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
};

<<<<<<< HEAD
export default function Header({ menuOpen, setMenuOpen, user }) {
=======
export default function Header({ menuOpen, setMenuOpen }: HeaderProps) {
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
  return (
    <header className="absolute top-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-between items-center">
      <a href="#" className="w-28 md:w-32">
        <Image
<<<<<<< HEAD
          src={
            menuOpen
              ? "/images/aralila-logo-exp-pr.svg"
              : "/images/aralila-logo-exp1.svg"
          }
=======
          src={menuOpen ? "/images/aralila-logo-exp-pr.svg" : "/images/aralila-logo-exp1.svg"}
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
          alt="Aralila Logo"
          width={128}
          height={32}
          priority
          className="transition-all duration-300"
        />
      </a>

      {!menuOpen && (
        <div className="flex items-center gap-4">
<<<<<<< HEAD
          <span className="text-sm font-medium">
            {user?.first_name + " " + user?.last_name}
          </span>
          <Avatar className="relative ring-2 ring-purple-500 shadow-[0_0_12px_3px_rgba(168,85,247,0.5)]">
            {/* <AvatarImage alt="Student Avatar" className="object-cover" /> */}
            <img
              // src={student.avatar}
              src={user?.profile_pic}
              alt="User avatar"
              className="h-11 w-11 rounded-full border-3 border-gray-500"
            />
          </Avatar>
=======

<Avatar className="relative ring-2 ring-purple-500 shadow-[0_0_12px_3px_rgba(168,85,247,0.5)]">
  <AvatarImage
    alt="Student Avatar"
    className="object-cover"
  />
  <AvatarFallback className="bg-purple-900 text-white">AL</AvatarFallback>
</Avatar>

>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c

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
