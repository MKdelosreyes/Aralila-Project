"use client";
import Sidebar from "./sidebar";
import Header from "./header";

export default function Layout({ sidebar, user, children }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-y-auto">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        {sidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto p-6 bg-purple-50">
          {children}
        </main>
      </div>
    </div>
  );
}
