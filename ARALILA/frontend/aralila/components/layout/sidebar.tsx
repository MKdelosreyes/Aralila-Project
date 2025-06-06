"use client";
import { useState } from "react";
import Image from "next/image";
import {
  X,
  Menu,
  Home,
  Book,
  BookOpen,
  Settings,
  LogOut,
  LayoutDashboard,
  BarChart,
  ListTodo,
  FileClock,
  IdCard,
  PanelTop,
  Grid,
  LayoutGrid,
} from "lucide-react";
import NavItem from "../ui/navItem";

interface SidebarProps {
  id: number;
}

export default function Sidebar({ id }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

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

      <div className="flex flex-col flex-grow p-4 space-y-3">
        <NavItem
          icon={<LayoutGrid />}
          label="Ulat"
          isOpen={isOpen}
          href={`/teacher/classroom/${id}/dashboard`}
          matchPath="/dashboard"
        />
        <NavItem
          icon={<ListTodo />}
          label="Pagsusulit"
          isOpen={isOpen}
          href={`/teacher/classroom/${id}/activities`}
          matchPath="/activities"
        />
        <NavItem
          icon={<IdCard />}
          label="Pending Requests"
          isOpen={isOpen}
          href={`/teacher/classroom/${id}/students-record`}
          matchPath="/students-record"
        />
        <NavItem
          icon={<BookOpen />}
          label="Mga Modyulo"
          isOpen={isOpen}
          href={`/teacher/classroom/${id}/modyulo`}
          matchPath="/modyulo"
        />
      </div>

      <div className="p-4 border-t">
        <NavItem
          icon={<Settings />}
          label="Settings"
          isOpen={isOpen}
          href={`/teacher/classroom/${id}/settings`}
          matchPath="/settings"
        />
        <NavItem
          icon={<LogOut />}
          label="Logout"
          isOpen={isOpen}
          href={`/teacher/classroom/${id}/logout`}
          matchPath="/logout"
        />
      </div>
    </div>
  );
}
