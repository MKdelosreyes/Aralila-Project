"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Sigurado ka ba?", // Default value
  description = "Gusto mo bang umalis sa larong ito?", // Default value
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 min-h-[30rem] max-w-md w-full text-center shadow-2xl border border-slate-200 flex flex-col justify-between"
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Lila */}
            <div className="w-44 h-44 mx-auto mb-6 relative">
              <Image
                src="/images/character/lila-worried2.png"
                alt="Worried Lila"
                fill
                className="object-contain"
              />
            </div>

            {/* Message */}
            <div>
              <h2 className="text-xl font-semibold text-slate-700 leading-snug">
                Wait! If you quit now, you&apos;ll lose your work
              </h2>
            </div>

            {/* buttons */}
            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={onClose}
                className="cursor-pointer w-full inline-block bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 uppercase"
              >
                Keep Learning
              </button>

              <button
                onClick={onConfirm}
                className="w-full text-red-600 font-semibold uppercase cursor-pointer"
              >
                QUIT GAME
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
