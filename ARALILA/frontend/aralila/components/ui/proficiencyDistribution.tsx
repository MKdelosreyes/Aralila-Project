"use client";

import React, { useState, useEffect } from "react";
import { Award, TrendingUp, BookOpen } from "lucide-react";
// import "../../styles/colors.css";

const ProficiencyDistribution = ({
  classInfo = {
    name: "Filipino 101",
    grade: "Grade 8",
    studentCount: 32,
    isActive: true,
  },
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatedCounts, setAnimatedCounts] = useState([0, 0, 0]);

  const proficiencyData = [
    {
      level: "Mahusay",
      count: 8,
      percentage: 32,
      color: "from-emerald-500 to-green-600",
      bgColor: "from-emerald-50 to-green-100",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-800",
      description: "Advanced Level",
      icon: Award,
    },
    {
      level: "Katamtaman",
      count: 15,
      percentage: 60,
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-indigo-100",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
      description: "Intermediate Level",
      icon: TrendingUp,
    },
    {
      level: "Paunang",
      count: 2,
      percentage: 8,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-100",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      description: "Beginning Level",
      icon: BookOpen,
    },
  ];

  const totalStudents = proficiencyData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const duration = 3500;
      const steps = 60;
      const stepDuration = duration / steps;

      proficiencyData.forEach((item, index) => {
        let currentStep = 0;
        const increment = item.count / steps;

        const counter = setInterval(() => {
          currentStep++;
          const currentValue = Math.min(
            Math.round(increment * currentStep),
            item.count
          );

          setAnimatedCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = currentValue;
            return newCounts;
          });

          if (currentStep >= steps) {
            clearInterval(counter);
          }
        }, stepDuration);
      });
    }
  }, [isLoaded]);

  return (
    <div className="flex flex-row justify-center items-center flex-1/3">
      {/* Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {proficiencyData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.level}
              className={`bg-gradient-to-br ${item.bgColor} border ${
                item.borderColor
              } rounded-2xl p-6 flex flex-col shadow-lg hover:shadow-2xl transform transition-all duration-700 ease-out hover:-translate-y-2 ${
                isLoaded
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{
                transitionDelay: `${index * 200}ms`,
              }}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 overflow-hidden">
                <div
                  className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full blur-xl`}
                ></div>
              </div>

              {/* Icon Header */}
              <div className="flex items-center justify-between mb-4 gap-1">
                <div
                  className={`flex-1 p-3 bg-gradient-to-br ${item.color} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div
                  className={`flex-1/3 px-3 py-1 bg-white/80 backdrop-blur-sm ${item.textColor} rounded-full text-xs align-middle wrap-break-word  font-semibold border ${item.borderColor}`}
                >
                  {item.description}
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10">
                {/* Count with enhanced animation */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span
                    className={`text-5xl font-bold ${
                      item.textColor
                    } transition-all duration-1000 ease-out ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 200 + 400}ms` }}
                  >
                    {animatedCounts[index]}
                  </span>
                  <span className="text-lg text-gray-600 font-medium">
                    students
                  </span>
                </div>

                {/* Percentage with progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-semibold ${item.textColor}`}>
                      {item.percentage}% ng klase
                    </span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1500 ease-out`}
                      style={{
                        width: isLoaded ? `${item.percentage}%` : "0%",
                        transitionDelay: `${index * 200 + 600}ms`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Level name with enhanced styling */}
                <div className="flex items-center justify-between">
                  <h4 className={`text-xl font-bold ${item.textColor}`}>
                    {item.level}
                  </h4>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          );
        })}
      </div>

      {/* Loading state overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-gray-600 font-medium">
              Analyzing proficiency data...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProficiencyDistribution;
