"use client";

import { useOshi } from "@/components/oshi";

export function OshiButton({ slug }: { slug: string }) {
  const { slug: current, choose, clear } = useOshi();
  const active = current === slug;

  return (
    <button
      type="button"
      onClick={() => (active ? clear() : choose(slug))}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium ${
        active ? "bg-[#f3f0ff] text-violet" : "border border-line text-ink"
      }`}
      aria-pressed={active}
    >
      <HeartIcon filled={active} />
      {active ? "오시로 두는 중" : "오시로 두기"}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 19.4 4.8 12.5a4.2 4.2 0 0 1 6-5.9L12 7.7l1.2-1.1a4.2 4.2 0 0 1 6 5.9z" strokeLinejoin="round" />
    </svg>
  );
}
