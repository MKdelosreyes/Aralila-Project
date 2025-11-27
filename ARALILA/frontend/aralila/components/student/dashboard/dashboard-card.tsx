import { motion, Variants } from "framer-motion";
import type { ReactNode } from "react";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
  href?: string; // Optional link for the card
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
} as const;

const DashboardCard = ({ children, className = "" }: DashboardCardProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className={`
        bg-white border-5 border-purple-300 rounded-3xl
        p-6 flex flex-col h-full
        transition-all duration-300
        hover:bg-purple-50 hover:border-purple-500
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default DashboardCard;
