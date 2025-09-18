"use client";
import React from "react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "all", label: "Lahat ng Gawain" },
    { id: "active", label: "Aktibo" },
    { id: "completed", label: "Natapos" },
  ];

  return (
    <div className="flex flex-1 w-full sm:w-auto items-center gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`pb-1 px-1 text-base font-medium transition-colors relative ${
            activeTab === tab.id
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
