"use client";
import { useState } from "react";
import Image from "next/image";
import { X, Menu, Home, Book, User, Settings, LogOut } from "lucide-react";
import NavItem from "../ui/navItem";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col h-full`}
    >
      <div className="p-4 flex items-center justify-between border-b ml-2">
        {/* <div className="w-full flex justify-center"></div> */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-col flex-grow p-4 space-y-6">
        <NavItem icon={<Home />} label="Ulat" isOpen={isOpen} isActive={true} />
        <NavItem icon={<Book />} label="Aralin" isOpen={isOpen} />
        <NavItem icon={<User />} label="Pagsusulit" isOpen={isOpen} />
      </div>

      <div className="p-4 border-t">
        <NavItem icon={<Settings />} label="Settings" isOpen={isOpen} />
        <NavItem icon={<LogOut />} label="Logout" isOpen={isOpen} />
      </div>
    </div>
  );
}
