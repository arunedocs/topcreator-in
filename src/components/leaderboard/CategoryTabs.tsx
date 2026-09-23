"use client";

import { CATEGORIES, type CategoryId } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: CategoryId;
  onChange: (category: CategoryId) => void;
}

export function CategoryTabs({ activeCategory, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
              isActive
                ? "border-white/20 bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            <span>{category.emoji}</span>
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
