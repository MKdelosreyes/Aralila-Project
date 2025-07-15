"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";

export default function SidebarMobile() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm flex justify-around py-2 sm:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center text-gray-700 transition",
              isActive ? "text-primary" : "hover:text-primary"
            )}
          >
            <Icon className="w-6 h-6" />
          </Link>
        );
      })}
    </div>
  );
}
