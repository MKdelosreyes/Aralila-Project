"use client";

import React from "react";
import { Users } from "lucide-react";

const ClassroomInfoCard = ({
  className = "",
  classInfo = {
    name: "Filipino 101",
    grade: "Grade 8",
    studentCount: 32,
    isActive: true,
    overallScore: 68,
    workAssigned: 36,
    bannerImage: "/images/forestbg.jpg", // Path to your banner image
  },
}) => {
  return (
    <div
      className={`flex-1/2 pr-3 bg-white rounded-lg shadow-xl overflow-hidden ${className}`}
    >
      <div className="flex items-center">
        {/* Left side - Banner image */}
        <div className="w-1/5 h-48 relative">
          <img
            src={classInfo.bannerImage}
            alt={`${classInfo.name} banner`}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 px-5 py-3">
          {/* Header with class name and status */}
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {classInfo.name}
            </h2>
            {classInfo.isActive ? (
              <div className="px-4 py-0 bg-green-100 text-green-800 rounded-full font-medium text-sm">
                ACTIVE
              </div>
            ) : (
              <div className="px-4 py-0 bg-gray-100 text-gray-800 rounded-full font-medium text-sm">
                INACTIVE
              </div>
            )}
          </div>

          {/* Class details */}
          <div className="flex items-center gap-8 mb-2">
            <span className="text-base text-gray-500">{classInfo.grade}</span>
            <div className="flex items-center gap-2">
              <Users className="text-gray-500" size={24} />
              <span className="text-base text-gray-500">
                {classInfo.studentCount} students
              </span>
            </div>
            <div className="ml-auto">
              <button className="font-medium text-xl text-black">
                Class Key
              </button>
            </div>
          </div>

          {/* Class metrics */}
          <div className="flex gap-12 justify-between items-center mt-5">
            {/* Overall score */}
            <div className="flex items-center gap-4">
              <div>
                <div className="text-gray-600 font-medium">
                  Overall
                  <br />
                  Class Score
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {classInfo.overallScore}%
                </div>
              </div>
              <div className="relative h-20 w-20">
                {/* Trophy SVG with fill level */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient
                      id="fillGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#a3e635" />
                      <stop offset="100%" stopColor="#65a30d" />
                    </linearGradient>
                  </defs>
                  {/* Trophy outline */}
                  <path
                    d="M70,20 H30 v10 c-10,0 -10,10 -10,20 c0,15 10,20 20,20 c5,0 5,10 5,10 h20 c0,0 0,-10 5,-10 c10,0 20,-5 20,-20 c0,-10 0,-20 -10,-20 v-10"
                    fill="none"
                    stroke="#fecaca"
                    strokeWidth="8"
                  />
                  {/* Trophy fill based on score */}
                  <path
                    d="M70,20 H30 v10 c-10,0 -10,10 -10,20 c0,15 10,20 20,20 c5,0 5,10 5,10 h20 c0,0 0,-10 5,-10 c10,0 20,-5 20,-20 c0,-10 0,-20 -10,-20 v-10"
                    fill="url(#fillGradient)"
                    transform={`scale(1, ${
                      classInfo.overallScore / 100
                    }) translate(0, ${100 - classInfo.overallScore})`}
                  />
                </svg>
              </div>
            </div>

            {/* Work assigned */}
            <div className="flex items-center gap-4">
              <div>
                <div className="text-gray-600 font-medium">
                  Work
                  <br />
                  Assigned
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {classInfo.workAssigned}
                </div>
              </div>
              <div className="relative h-20 w-20">
                {/* Circular progress indicator */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f0fdf4"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - 251.2 * 0.75}
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="32"
                    fill="none"
                    stroke="#f0fdf4"
                    strokeWidth="8"
                  />
                  <circle cx="35" cy="42" r="8" fill="#a3e635" />
                  <circle cx="65" cy="42" r="8" fill="#a3e635" />
                  <circle cx="50" cy="28" r="6" fill="#a3e635" />
                  <circle cx="70" cy="58" r="10" fill="#facc15" />
                  <circle cx="30" cy="58" r="10" fill="#facc15" />
                  <circle cx="50" cy="72" r="12" fill="#fbbf24" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomInfoCard;
