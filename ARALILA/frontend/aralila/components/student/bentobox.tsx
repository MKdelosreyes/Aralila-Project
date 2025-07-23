import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type BentoBoxProps = {
  children: ReactNode;
  className?: string;
  href?: string;
};

const BentoBox = ({ children, className = "", href }: BentoBoxProps) => {
  const content = (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        },
      }}
      className={`
        bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl
        p-6 flex flex-col transition-all duration-300
        hover:bg-white/10 hover:border-white/20
        ${className}
      `}
    >
      {children}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

export default BentoBox;
