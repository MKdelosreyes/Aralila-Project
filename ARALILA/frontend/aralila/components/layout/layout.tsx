"use client";
import Sidebar from "./sidebar";
import Header, { User } from "./header";
import { ReactNode } from "react";

interface LayoutProps {
  sidebar: ReactNode;
  id: number;
  user: User;
  children: ReactNode;
  activeTab?: number;
}

export default function Layout({
  sidebar,
  id,
  user,
  children,
  activeTab,
}: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-y-auto">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        {sidebar && <Sidebar id={id} />}
        <main className="flex-1 overflow-y-auto p-6 bg-purple-50">
          {children}
        </main>
      </div>
    </div>
  );
}
