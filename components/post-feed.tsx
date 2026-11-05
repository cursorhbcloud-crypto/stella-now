"use client";

import { useMemo, useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { members } from "@/content/members";
import { posts, type PostPlatform } from "@/content/posts";

const platforms = [
  { id: "all", label: "전체" },
  { id: "fanding", label: "팬딩" },
  { id: "x", label: "X" },
] as const;

type PlatformFilter = (typeof platforms)[number]["id"];

export function PostFeed() {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [member, setMember] = useState("all");

  const counts = useMemo(() => {
    const scoped = posts.filter((post) => member === "all" || post.memberSlug === member);
    return {
      all: scoped.length,
      fanding: scoped.filter((post) => post.platform === "fanding").length,
      x: scoped.filter((post) => post.platform === "x").length,
    };
  }, [member]);

  const visible = posts.filter((post) => {
    if (member !== "all" && post.memberSlug !== member) return false;
    if (platform !== "all" && post.platform !== platform) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">게시물</h1>
      <p className="mt-1 text-[15px] text-muted">스텔라이브 최신 소식</p>

      <p className="mt-6 text-sm text-muted">플랫폼</p>
      <div className="mt-3 flex gap-2">
        {platforms.map((item) => (
          <FilterChip
            key={item.id}
            active={platform === item.id}
            label={`${item.label} (${counts[item.id]})`}
            onClick={() => setPlatform(item.id)}
          />
        ))}
      </div>

      <p className="mt-5 text-sm text-muted">멤버</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden">
        <FilterChip active={member === "all"} label="전체" onClick={() => setMember("all")} />
        {members.map((item) => (
          <FilterChip
            key={item.slug}
            active={member === item.slug}
            label={item.name}
            onClick={() => setMember(item.slug)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#b0b4be]">게시물이 없습니다</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 text-[15px] font-medium text-violet"
          >
            새로고침
          </button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {visible.map((post) => {
            const name = members.find((item) => item.slug === post.memberSlug)?.name;
            return (
              <li key={post.id}>
                <a href={post.href} target="_blank" rel="noreferrer" className="flex gap-3 py-4">
                  {post.memberSlug ? <ProfileAvatar slug={post.memberSlug} className="size-10" /> : null}
                  <span className="min-w-0">
                    <span className="block text-sm">
                      <span className="font-medium">{name ?? platformLabel(post.platform)}</span>
                      <span className="text-muted"> · {post.date}</span>
                    </span>
                    <span className="mt-1 block text-[15px] leading-6">{post.title}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium ${
        active ? "bg-violet text-white" : "bg-[#f2f3f7] text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function platformLabel(platform: PostPlatform) {
  return platform === "fanding" ? "팬딩" : "X";
}
