"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { members, units, unitNameEn } from "@/content/members";
import { ProfileAvatar } from "@/components/profile-avatar";
import { LiveMark } from "@/components/live-mark";
import { isLive } from "@/content/live";

const filters = [
  { id: "all", label: "전체" },
  { id: "1", label: "1기" },
  { id: "2", label: "2기" },
  { id: "3", label: "3기" },
  { id: "4", label: "4기" },
  { id: "grad", label: "졸업생" },
] as const;

type FilterId = (typeof filters)[number]["id"];

export function MemberList() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members
      .filter((member) => {
        const unit = units.find((item) => item.id === member.unit);
        if (filter === "grad") return false;
        if (filter !== "all" && String(unit?.gen) !== filter) return false;
        if (!needle) return true;
        return (
          member.name.toLowerCase().includes(needle) ||
          member.nameEn.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => Number(isLive(b.slug)) - Number(isLive(a.slug)));
  }, [query, filter]);

  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">멤버</h1>
      <p className="mt-1 text-[15px] text-muted">스텔라이브 멤버를 만나보세요</p>

      <label className="mt-5 flex h-14 items-center gap-3 rounded-2xl bg-[#f2f3f7] px-4">
        <SearchIcon />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="멤버 이름 검색"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#b0b4be]"
        />
      </label>

      <p className="mt-5 text-sm text-[#8b909c]">기수별 필터</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = item.id === filter;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item.id)}
              className={`h-9 shrink-0 rounded-full px-3.5 text-sm font-medium ${
                active ? "bg-violet text-white" : "border border-[#e6e8ee] bg-white text-ink"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#c5c8d0]">
          {filter === "grad" ? "졸업한 멤버가 없습니다" : "해당하는 멤버가 없습니다"}
        </p>
      ) : (
        <ul className="mt-5 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {visible.map((member) => (
            <li key={member.slug}>
              <Link
                href={`/members/${member.slug}`}
                className="flex items-center gap-4 rounded-2xl bg-[#f2f3f7] px-4 py-3.5"
              >
                <span className="relative">
                  <ProfileAvatar slug={member.slug} />
                  {isLive(member.slug) ? (
                    <span className="absolute right-0 top-0 size-3 rounded-full border-2 border-[#f2f3f7] bg-[#ef3b3b]" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[16px] font-bold leading-tight">
                    {member.name}
                    {isLive(member.slug) ? <LiveMark /> : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-violet">{member.nameEn}</span>
                  <span className="mt-0.5 block text-xs text-[#8b909c]">{unitNameEn(member.unit)}</span>
                </span>
                <ChevronIcon />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-violet" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-[#c5c8d0]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
