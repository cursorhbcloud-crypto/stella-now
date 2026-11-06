"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiveMark } from "@/components/live-mark";
import { ProfileAvatar } from "@/components/profile-avatar";
import { type LiveInfo, liveInfo } from "@/content/live";
import { chzzkLiveUrl, members } from "@/content/members";
import { refreshMemberLives } from "@/lib/refresh-live";

export function LiveNow() {
  const [now, setNow] = useState(() => Date.now());
  const [statuses, setStatuses] = useState<Record<string, LiveInfo>>(() =>
    Object.fromEntries(members.map((member) => [member.slug, liveInfo(member.slug)])),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const onAir = members
    .filter((member) => statuses[member.slug]?.live)
    .sort((a, b) => (statuses[b.slug]?.viewers ?? 0) - (statuses[a.slug]?.viewers ?? 0));
  const shown = onAir.slice(0, 3);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setFailed(false);
    setNow(Date.now());
    try {
      const fresh = await refreshMemberLives(members);
      setStatuses((current) => ({ ...current, ...fresh }));
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {onAir.length > 0 ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-[#ef3b3b]">
              <span className="size-2 rounded-full bg-[#ef3b3b]" />
              LIVE
            </p>
          ) : null}
          <h2 className={`text-[22px] font-bold leading-tight ${onAir.length > 0 ? "mt-3" : ""}`}>
            {onAir.length > 0 ? "지금 방송 중" : "멤버 방송 예정"}
          </h2>
        </div>
        <button
          type="button"
          aria-label="방송 새로고침"
          aria-busy={refreshing}
          onClick={() => void refresh()}
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted"
        >
          <RefreshIcon spinning={refreshing} />
        </button>
      </div>
      {failed ? <p className="mt-2 text-xs text-muted">방송 정보를 불러오지 못했어요</p> : null}
      {onAir.length === 0 ? (
        <>
          <p className="mt-2 text-sm text-muted">현재 방송 중인 멤버가 없습니다</p>
          <Link
            href="/members"
            className="mt-5 flex h-12 items-center justify-center rounded-xl bg-violet text-[15px] font-medium text-white md:max-w-xs"
          >
            방송 확인하기
          </Link>
        </>
      ) : (
        <>
          <ul className="mt-4 space-y-2">
            {shown.map((member) => {
              const info = statuses[member.slug];
              return (
                <li key={member.slug}>
                  <a href={chzzkLiveUrl(member.chzzk)} className="flex items-center gap-3 rounded-xl py-1">
                    <ProfileAvatar slug={member.slug} className="size-11" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[15px] font-medium">
                        {member.name}
                        <LiveMark />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {broadcastLine(info?.openDate ?? null, info?.viewers ?? 0, now)}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <Link
            href="/members"
            className="mt-5 flex h-12 items-center justify-center rounded-xl bg-violet text-[15px] font-medium text-white md:max-w-xs"
          >
            방송 확인하기
          </Link>
        </>
      )}
    </>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-4 ${spinning ? "animate-spin" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 12a8 8 0 0 1-14.5 4.9L4 15" />
      <path d="M4 12a8 8 0 0 1 14.5-4.9L20 9" />
      <path d="M20 4v5h-5" />
      <path d="M4 20v-5h5" />
    </svg>
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
