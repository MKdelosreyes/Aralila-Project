"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden sm:flex h-screen bg-white border-r shadow-sm p-4 flex-col transition-all w-20 md:w-64">
      {/* Logo */}
      <div className="mb-8 justify-center">
        <div className="hidden md:block">
          <Image src="/images/aralila-logo-exp-pr.svg" alt="Aralila" width={150} height={40} />
        </div>
        <div className="md:hidden">
          <Image src="/images/aralila-logo-tr.svg" alt="A" width={40} height={40} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition",
                isActive
                  ? "bg-purple-500 text-white"
                  : "text-text hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
