"use client";

import React from "react";
import { Users, Trophy, BookOpen } from "lucide-react";

// classInfo = {
//     name: "Filipino 101",
//     grade: "Grade 8",
//     studentCount: 32,
//     isActive: true,
//     overallScore: 68,
//     workAssigned: 36,
//     bannerImage: "/images/forestbg.jpg", // Path to your banner image
//   },

const ClassroomInfoCard = ({ classInfo, studentSize }) => {
  return (
    <div
      className={`flex-1/2 pr-3 bg-white rounded-lg shadow-xl overflow-hidden`}
    >
      <div className="flex items-center">
        {/* Left side - Banner image */}
        <div className="w-1/5 h-48 relative">
          <img
            src="/images/forestbg.jpg"
            alt={`${classInfo?.class_name} banner`}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 px-5 py-3">
          {/* Header with class name and status */}
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {classInfo?.class_name}
            </h2>
            {classInfo?.isActive ? (
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
            <span className="text-base text-gray-500">
              {`Section ${classInfo?.section}`}
            </span>
            <div className="flex items-center gap-2">
              <Users className="text-gray-500" size={24} />
              {studentSize === 0 ? (
                <span className="text-base text-gray-500">
                  No students enrolled in this class
                </span>
              ) : (
                <span className="text-base text-gray-500">
                  {studentSize}
                  {studentSize === 1 ? " student" : " students"}
                </span>
              )}
            </div>
            <div className="ml-auto">
              <button className="font-medium text-base text-black">
                Class Key
              </button>
            </div>
          </div>

          {/* Class metrics */}
          <div className="flex gap-12 justify-between items-center mt-5">
            {/* Overall score */}
            <div className="flex items-center gap-4">
              <div>
                {/* <img src="/images/trophy.svg" alt="trophy-icon" /> */}
                <Trophy className="w-12 h-12 text-yellow-600" />
              </div>
              <div>
                <div className="text-gray-600 font-medium">
                  Overall Class Score
                </div>
                <div className="text-xl font-bold text-gray-900">72%</div>
              </div>
            </div>

            {/* Work assigned */}
            <div className="flex items-center gap-4">
              <div>
                {/* <img
                  src="/images/assigned-activities.svg"
                  alt="assigned-activities-icon"
                  className="h-full w-full object-cover"
                /> */}
                <BookOpen className="w-12 h-12 text-purple-900" />
              </div>
              <div>
                <div className="text-gray-600 font-medium">Work Assigned</div>
                <div className="text-xl font-bold text-gray-900">
                  {/* {classInfo.workAssigned} */}20
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomInfoCard;
