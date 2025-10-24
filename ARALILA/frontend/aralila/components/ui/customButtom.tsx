"use client";
import React from "react";
import { Plus } from "lucide-react";

interface CustomButtonProps {
  text: string;
  onClick: () => void;
}

const CustomButton = ({ text, onClick }: CustomButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white text-sm px-6 py-3 rounded-md font-semibold transition-colors shadow-lg hover:shadow-xl"
    >
      <Plus className="w-5 h-5" />
      {text}
    </button>
  );
};

export default CustomButton;
