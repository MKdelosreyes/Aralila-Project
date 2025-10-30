"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AnimatedBackgroundProps {
  img_path: string;
}

const ChallengesBackground = ({ img_path }: AnimatedBackgroundProps) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <motion.div
        className="absolute inset-[-5%] w-[110%] h-[110%]"
        animate={{ x: ["0%", "-5%", "0%"], y: ["0%", "2%", "0%"] }}
        transition={{
          duration: 45,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <Image
          src={img_path}
          alt="Forest Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
      </motion.div>

      <div className="min-h-screen absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 " />
    </div>
  );
};

export default ChallengesBackground;
