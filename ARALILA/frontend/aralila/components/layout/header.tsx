"use client";
import { Bell } from "lucide-react";
import Image from "next/image";

export default function Header({ user }) {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
      <Image
        src={"/images/aralila-logo-exp-pr.svg"}
        alt="Aralila Logo"
        width={160}
        height={40}
        priority
      />
      {/* 
      <div className="flex items-center gap-4 justify-self-end">
        <div className="relative w-64 justify-self-end">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div> */}

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-purple-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {user?.first_name + " " + user?.last_name}
          </span>
          <img
            // src={student.avatar}
            src={user?.profile_pic}
            alt="User avatar"
            className="h-10 w-10 rounded-full border-3 border-gray-500"
          />
        </div>
      </div>
    </header>
  );
}
