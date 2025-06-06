"use client";

import React, { useState, useEffect } from "react";

const ProficiencyDistribution = ({
  classInfo = {
    name: "Filipino 101",
    grade: "Grade 8",
    studentCount: 32,
    isActive: true,
  },
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Sample data for proficiency levels
  const proficiencyData = [
    {
      level: "Mahusay",
      count: 5,
      percentage: 20,
      color: "bg-green-400",
      description: "Advanced Level",
    },
    {
      level: "Katamtaman",
      count: 12,
      percentage: 48,
      color: "bg-yellow-400",
      description: "Intermediate Level",
    },
    {
      level: "Paunang",
      count: 8,
      percentage: 32,
      color: "bg-orange-400",
      description: "Beginning Level",
    },
  ];

  const totalStudents = proficiencyData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-row m-0 justify-center items-center bg-white flex-1/3">
      {/* <div className="flex-1 items-center justify-center">
        <h5 className="text-center">
          Proficiency Distribution of Students Here...
        </h5>
      </div> */}
      {/* Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 h-48">
        {proficiencyData.map((item, index) => (
          <div
            key={item.level}
            className={`${
              item.color
            } shadow-xl rounded-lg p-6 text-white relative overflow-hidden transform transition-all duration-700 ease-out ${
              isLoaded
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-8 opacity-0 scale-95"
            }`}
            style={{
              transitionDelay: `${index * 150}ms`,
            }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 bg-opacity-10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-purple-200 bg-opacity-10 rounded-full -ml-6 -mb-6"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Count with animation */}
              <div className="text-4xl font-bold mb-2">
                <span
                  className={`inline-block transition-transform duration-1000 ease-out ${
                    isLoaded ? "translate-y-0" : "translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 150 + 300}ms` }}
                >
                  {isLoaded ? item.count : 0}
                </span>
              </div>

              {/* Percentage */}
              <div className="text-lg font-medium mb-1 opacity-100 text-white">
                {item.percentage}% ng klase
              </div>

              {/* Level name */}
              <div className="text-sm font-medium opacity-80 text-purple-500">
                {item.level}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading state overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProficiencyDistribution;
