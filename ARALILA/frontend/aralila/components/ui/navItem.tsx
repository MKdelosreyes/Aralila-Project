"use client";

export default function NavItem({ icon, label, isOpen, isActive = false }) {
  return (
    <div
      className={`flex items-center p-2 cursor-pointer rounded-lg ${
        isActive
          ? "bg-purple-100 text-purple-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className="w-5 h-5 mr-3">{icon}</div>
      {isOpen && <span className="font-medium">{label}</span>}
    </div>
  );
}
