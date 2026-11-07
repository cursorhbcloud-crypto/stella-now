"use client";

import { useEffect, useRef, useState } from "react";
import { useOshi } from "@/components/oshi";
import { chzzkLiveUrl, members, shortName } from "@/content/members";
import { refreshMemberLives } from "@/lib/refresh-live";

export function OshiAlert() {
  const { slug, alert } = useOshi();
  const [banner, setBanner] = useState<string | null>(null);
  const primed = useRef(false);
  const seen = useRef("");

  useEffect(() => {
    primed.current = false;
    seen.current = "";
    if (!alert || !slug) return;
    const member = members.find((item) => item.slug === slug);
    if (!member) return;
    const watched = member;
    let stop = false;

    async function check() {
      try {
        const fresh = await refreshMemberLives([watched]);
        if (stop) return;
        const info = fresh[watched.slug];
        if (!info) return;
        const token = info.live ? info.openDate || "live" : "";
        if (!primed.current) {
          primed.current = true;
          seen.current = token;
          return;
        }
        if (info.live && token !== seen.current) {
          seen.current = token;
          setBanner(watched.slug);
          notify(watched);
        } else if (!info.live) {
          seen.current = "";
        }
      } catch {
        // A failed check keeps the previous status.
      }
    }

    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [alert, slug]);

  const member = members.find((item) => item.slug === banner);
  if (!alert || !member) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-lg">
      <a href={chzzkLiveUrl(member.chzzk)} className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{shortName(member.name)} 방송이 시작됐어요</span>
        <span className="mt-0.5 block text-xs text-white/70">치지직에서 볼 수 있어요</span>
      </a>
      <button type="button" onClick={() => setBanner(null)} className="text-sm text-white/80">
        닫기
      </button>
    </div>
  );
}

function notify(member: { name: string; chzzk: string }) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const note = new Notification(`${shortName(member.name)} 방송이 시작됐어요`, {
    body: "치지직에서 볼 수 있어요",
  });
  note.onclick = () => window.open(chzzkLiveUrl(member.chzzk), "_blank", "noopener");
}
