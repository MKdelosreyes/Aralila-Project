"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavItemProps {
  label: string;
  isOpen: boolean;
  icon: ReactNode;
  href: string;
  matchPath?: string;
}

export default function NavItem({
  label,
  isOpen,
  icon,
  href,
  matchPath,
}: NavItemProps) {
  const router = useRouter();

  // Match either the exact href or a custom match string

  const pathname = usePathname(); // returns string like "/teacher/classroom/123/dashboard"
  const isActive = matchPath ? pathname.includes(matchPath) : pathname === href;

  return (
    <Link href={href}>
      <div
        className={`flex items-center justify-center cursor-pointer transition rounded-lg gap-3  ${
          isActive
            ? "bg-purple-100 text-purple-700"
            : "text-gray-600 hover:bg-gray-100"
        } ${isOpen ? "justify-start pl-3" : ""} ${
          label === "Umpisa"
            ? "bg-purple-600 text-white hover:text-black hover:bg-purple-400"
            : ""
        }`}
      >
        <div className="py-2 ">{icon}</div>
        {isOpen && <span className="font-medium">{label}</span>}
      </div>
    </Link>
  );
}
