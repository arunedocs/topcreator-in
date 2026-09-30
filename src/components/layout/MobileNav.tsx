"use client";

import { Activity, Compass, Home, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Discover", icon: Compass },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/dashboard", label: "Profile", icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 px-1 py-2">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-1 text-[10px]",
                active ? "font-medium text-amber-300" : "text-zinc-500"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-amber-300")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
