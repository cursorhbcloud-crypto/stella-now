"use client";

import { LiveMark } from "@/components/live-mark";
import { broadcastLine, useLiveStatuses } from "@/components/live-status";
import { useOshi } from "@/components/oshi";
import { ProfileAvatar } from "@/components/profile-avatar";
import { SettingsButton } from "@/components/settings-button";
import { chzzkLiveUrl, members } from "@/content/members";

export function OnAir() {
  const { now, statuses, refreshing, failed, refresh } = useLiveStatuses();
  const { slug: oshi } = useOshi();
  const onAir = members
    .filter((member) => statuses[member.slug]?.live)
    .sort((a, b) => (statuses[b.slug]?.viewers ?? 0) - (statuses[a.slug]?.viewers ?? 0));
  const ordered = onAir.filter((member) => member.slug === oshi).concat(onAir.filter((member) => member.slug !== oshi));

  return (
    <div>
      <div className="flex items-start justify-between">
        <h1 className="text-[32px] font-bold tracking-tight">지금 방송 중</h1>
        <div className="flex items-center">
          <button
            type="button"
            aria-label="방송 새로고침"
            aria-busy={refreshing}
            onClick={() => void refresh()}
            className="grid size-10 place-items-center text-muted"
          >
            <RefreshIcon spinning={refreshing} />
          </button>
          <SettingsButton />
        </div>
      </div>
      <p className="mt-1 text-[15px] text-muted">
        {onAir.length > 0 ? `${onAir.length}명이 방송 중이에요` : "방송 중인 멤버만 보여요"}
      </p>
      {failed ? <p className="mt-3 text-sm text-muted">방송 정보를 불러오지 못했어요</p> : null}
      {ordered.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-[#f7f8fb] px-4 py-4 text-sm text-muted">현재 방송 중인 멤버가 없습니다</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {ordered.map((member) => {
            const info = statuses[member.slug];
            return (
              <li key={member.slug}>
                <a href={chzzkLiveUrl(member.chzzk)} className="flex items-center gap-4 rounded-2xl bg-[#f2f3f7] px-4 py-3.5">
                  <ProfileAvatar slug={member.slug} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[16px] font-bold leading-tight">
                      {member.name}
                      <LiveMark />
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {broadcastLine(info?.openDate ?? null, info?.viewers ?? 0, now)}
                    </span>
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

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-5 ${spinning ? "animate-spin" : ""}`}
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
