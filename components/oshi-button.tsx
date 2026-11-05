"use client";

import { useOshi } from "@/components/oshi";

export function OshiButton({ slug }: { slug: string }) {
  const { slug: current, choose } = useOshi();
  const active = current === slug;

  return (
    <button
      type="button"
      onClick={() => choose(slug)}
      className={`flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium ${
        active ? "bg-[#f3f0ff] text-violet" : "border border-line text-ink"
      }`}
      aria-pressed={active}
    >
      {active ? "오시로 두는 중" : "오시로 두기"}
    </button>
  );
}
