"use client";

import React from "react";

const ProficiencyDistribution = ({
  classInfo = {
    name: "Filipino 101",
    grade: "Grade 8",
    studentCount: 32,
    isActive: true,
  },
}) => {
  return (
    <div className="flex flex-row m-0 justify-center items-center bg-white flex-1/2 rounded-lg shadow-xl">
      <div className="flex-1 items-center justify-center">
        <h5 className="text-center">
          Proficiency Distribution of Students Here...
        </h5>
      </div>
    </div>
  );
};

export default ProficiencyDistribution;
