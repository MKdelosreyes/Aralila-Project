"use client";

import React, { useState } from "react";
import { Users, Trophy, BookOpen, Check, Copy } from "lucide-react";

// Define the shape of classroom information
interface ClassInfo {
  class_name: string;
  section: string;
  class_key: string;
  status: boolean;
}

// Define the component props
interface ClassroomInfoCardProps {
  classInfo: ClassInfo;
  studentSize?: number;
}

const ClassroomInfoCard: React.FC<ClassroomInfoCardProps> = ({
  classInfo,
  studentSize,
}) => {
  const [copied, setCopied] = useState(false);
  const sampleStudentSize = studentSize || 28;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(classInfo?.class_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex-1/2 pr-3">
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl overflow-hidden border border-purple-100 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-stretch min-h-[200px]">
          {/* Left side - Enhanced banner with overlay */}
          <div className="w-1/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="text-xs font-medium opacity-90">CLASSROOM</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
          </div>

          {/* Right side - Enhanced content */}
          <div className="flex-1 px-8 py-6">
            {/* Header with enhanced status badge */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  {classInfo?.class_name}
                </h2>
                <div className="text-lg text-gray-600 font-medium">
                  Section {classInfo?.section}
                </div>
              </div>

              {classInfo?.status ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full font-semibold text-sm border border-green-200 shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  ACTIVE
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm border border-gray-200">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  INACTIVE
                </div>
              )}
            </div>

            {/* Enhanced student count and class key */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                <Users className="text-purple-600" size={20} />
                {sampleStudentSize === 0 ? (
                  <span className="text-sm text-gray-600 font-medium">
                    No students enrolled
                  </span>
                ) : (
                  <span className="text-sm text-gray-700 font-medium">
                    {sampleStudentSize}{" "}
                    {sampleStudentSize === 1 ? "student" : "students"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  Class Key:
                </span>
                <button
                  onClick={handleCopy}
                  className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-800 font-mono font-bold text-sm border border-purple-200 hover:border-purple-400 rounded-lg transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                >
                  <span className="tracking-wide">{classInfo?.class_key}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  )}

                  {copied && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-green-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 animate-in fade-in duration-200">
                      <div className="relative">
                        Copied successfully!
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced metrics cards */}
            <div className="grid grid-cols-2 gap-6">
              {/* Overall score card */}
              <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold text-sm mb-1">
                      Overall Class Score
                    </div>
                    <div className="text-2xl font-bold text-gray-900 flex items-baseline gap-1">
                      72
                      <span className="text-lg text-gray-600">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work assigned card */}
              <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold text-sm mb-1">
                      Work Assigned
                    </div>
                    <div className="text-2xl font-bold text-gray-900 flex items-baseline gap-1">
                      20
                      <span className="text-lg text-gray-600">tasks</span>
                    </div>
                  </div>
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
