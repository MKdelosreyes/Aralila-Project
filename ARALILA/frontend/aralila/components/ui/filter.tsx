"use client";
import React from "react";
import { Filter } from "lucide-react";

// Define valid sort options
type SortOption = "date" | "name" | "status" | "class";

interface FilterProps {
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
}

const Filters: React.FC<FilterProps> = ({ sortBy, setSortBy }) => {
  return (
    <div className="relative">
      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="pl-12 pr-8 py-2 border-2 border-gray-200 rounded-md focus:border-purple-400 focus:outline-none bg-white text-sm text-gray-700 font-medium appearance-none cursor-pointer"
      >
        <option value="date">Ayusin ayon sa petsa</option>
        <option value="name">Ayusin ayon sa pangalan</option>
        <option value="status">Ayusin ayon sa status</option>
        <option value="class">Ayusin ayon sa klase</option>
      </select>
    </div>
  );
};

export default Filters;
