import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore creator categories on TopCreator.in",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Categories</h1>
      <p className="mt-2 text-sm text-zinc-400">Pick a lane and compete for the top spot.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-zinc-600"
          >
            <p className="text-2xl">{category.emoji}</p>
            <p className="mt-3 text-lg font-medium text-white">{category.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
