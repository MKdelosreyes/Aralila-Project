"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

interface TutorialStep {
  videoSrc: string;
  description: string;
}

interface TutorialModalProps {
  steps: TutorialStep[];
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  steps,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Autoplay video on step change without controls
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const { videoSrc, description } = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 z-50 p-2 bg-gray-200 rounded-full hover:bg-gray-300 shadow"
        >
          <X size={28} />
        </button>

        {/* Video */}
        <div className="flex-1 w-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            className="w-full h-full object-contain"
          />
        </div>

        {/* Centered Description */}
        <div className="p-6 border-t flex justify-center items-center">
          <p className="text-gray-800 text-lg text-center">{description}</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded bg-gray-200 hover:bg-gray-300 transition ${
              currentStep === 0
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <ArrowLeft size={24} /> Back
          </button>
          <span className="font-semibold">
            Step {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`flex items-center gap-2 px-5 py-3 rounded bg-gray-200 hover:bg-gray-300 transition ${
              currentStep === steps.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            Next <ArrowRight size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
