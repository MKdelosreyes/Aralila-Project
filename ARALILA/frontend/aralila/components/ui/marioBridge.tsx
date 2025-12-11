"use client";

import React from "react";

interface MarioBridgeProps {
  width: number;
  height?: number;
  variant?: "platform" | "gap";
}

export const MarioBridge: React.FC<MarioBridgeProps> = ({
  width,
  height = 16,
  variant = "platform",
}) => {
  const isGap = variant === "gap";

  // Colors
  const baseColor = isGap ? "#a1a1aa" : "#78716c"; // stone colors
  const darkColor = isGap ? "#71717a" : "#57534e";
  const lightColor = isGap ? "#d4d4d8" : "#a8a29e";

  const brickWidth = 24;
  const brickCount = Math.ceil(width / brickWidth);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block drop-shadow-md"
    >
      <defs>
        {/* Brick gradient */}
        <linearGradient id="brickGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="50%" stopColor={baseColor} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
      </defs>

      {/* Base platform */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="url(#brickGradient)"
        rx="3"
      />

      {/* Individual bricks */}
      {Array.from({ length: brickCount }).map((_, i) => {
        const x = i * brickWidth;
        const offsetY = i % 2 === 0 ? 0 : height * 0.15;

        return (
          <g key={i}>
            {/* Brick outline */}
            <rect
              x={x}
              y={offsetY}
              width={brickWidth - 2}
              height={height - offsetY}
              fill="none"
              stroke={darkColor}
              strokeWidth="1"
              opacity="0.4"
            />

            {/* Highlight */}
            <rect
              x={x + 2}
              y={offsetY + 2}
              width={brickWidth - 6}
              height={3}
              fill={lightColor}
              opacity="0.6"
              rx="1"
            />

            {/* Shadow */}
            <rect
              x={x + 2}
              y={height - 4}
              width={brickWidth - 6}
              height={2}
              fill="black"
              opacity="0.3"
            />
          </g>
        );
      })}

      {/* Top edge highlight */}
      <rect
        x="0"
        y="0"
        width={width}
        height="2"
        fill="white"
        opacity="0.4"
        rx="3"
      />

      {/* Bottom shadow */}
      <rect
        x="0"
        y={height - 2}
        width={width}
        height="2"
        fill="black"
        opacity="0.3"
        rx="3"
      />
    </svg>
  );
};
