"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarIconProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  href: string;
}

export default function SidebarIcon({ icon: Icon, text, href }: SidebarIconProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`p-3 rounded-full transition-all duration-300 cursor-pointer
          ${isActive ? "bg-purple-600 text-white" : "bg-white/5 text-slate-300 hover:bg-purple-600/50 hover:text-white"}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-sm font-semibold whitespace-nowrap rounded-md shadow-lg"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}
