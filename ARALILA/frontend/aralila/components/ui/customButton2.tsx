"use client";
import React from "react";
import { Filter, Plus } from "lucide-react";

const CustomButton2 = ({
  onClick,
  text,
  variant = "primary",
  icon: Icon,
  size = "md",
}) => {
  const baseClasses =
    "rounded-xl font-medium transition-all duration-200 flex items-center gap-2 active:scale-95";
  const variants = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
    success:
      "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {text}
    </button>
  );
};

export default CustomButton2;
