"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiveMark } from "@/components/live-mark";
import { ProfileAvatar } from "@/components/profile-avatar";
import { members } from "@/content/members";
import { liveInfo } from "@/content/live";

export function LiveNow() {
  const [now, setNow] = useState(() => Date.now());
  const onAir = members.filter((member) => liveInfo(member.slug).live);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (onAir.length === 0) {
    return (
      <>
        <h2 className="mt-3 text-[22px] font-bold leading-tight">멤버 방송 예정</h2>
        <p className="mt-2 text-sm text-muted">현재 방송 중인 멤버가 없습니다</p>
        <Link
          href="/members"
          className="mt-5 flex h-12 items-center justify-center rounded-xl bg-violet text-[15px] font-medium text-white md:max-w-xs"
        >
          방송 확인하기
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="mt-3 text-[22px] font-bold leading-tight">지금 방송 중</h2>
      <ul className="mt-4 space-y-2">
        {onAir.map((member) => {
          const info = liveInfo(member.slug);
          return (
            <li key={member.slug}>
              <a href={member.chzzk} className="flex items-center gap-3 rounded-xl py-1">
                <ProfileAvatar slug={member.slug} className="size-11" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[15px] font-medium">
                    {member.name}
                    <LiveMark />
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {broadcastLine(info.openDate, info.viewers, now)}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function broadcastLine(openDate: string | null, viewers: number, now: number) {
  const time = openDate ? elapsed(openDate, now) : null;
  const watching = `시청 ${viewers.toLocaleString("ko-KR")}명`;
  return time ? `${time} · ${watching}` : watching;
}

function elapsed(openDate: string, now: number) {
  const started = new Date(`${openDate.replace(" ", "T")}+09:00`).getTime();
  const minutes = Math.max(0, Math.floor((now - started) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}시간 ${rest}분` : `${rest}분`;
}
