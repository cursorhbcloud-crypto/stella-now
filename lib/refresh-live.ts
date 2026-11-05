import type { LiveInfo } from "@/content/live";

type LivePayload = {
  content?: {
    status?: string;
    closeDate?: string | null;
    concurrentUserCount?: number;
    openDate?: string | null;
  };
};

const publishedLive =
  "https://api.github.com/repos/cursorhbcloud-crypto/stella-now/contents/content/live.json";

export function parseLiveStatus(payload: LivePayload): LiveInfo {
  const content = payload?.content;
  if (!content || typeof content.status !== "string") throw new Error("missing live status");
  const live = content.status === "OPEN" && !content.closeDate;
  return {
    live,
    viewers: live ? Number(content.concurrentUserCount) || 0 : 0,
    openDate: live && typeof content.openDate === "string" ? content.openDate : null,
  };
}

function normalizeLive(value: unknown): LiveInfo {
  if (typeof value === "object" && value) {
    const row = value as Partial<LiveInfo>;
    return {
      live: row.live === true,
      viewers: row.viewers ?? 0,
      openDate: row.openDate ?? null,
    };
  }
  return { live: false, viewers: 0, openDate: null };
}

export async function fetchPublishedLive(): Promise<Record<string, LiveInfo>> {
  const response = await fetch(`${publishedLive}?t=${Date.now()}`, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github.raw+json" },
  });
  if (!response.ok) throw new Error(String(response.status));
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("bad live file");
  return Object.fromEntries(Object.entries(data).map(([slug, value]) => [slug, normalizeLive(value)]));
}

async function readChzzk(url: string): Promise<LiveInfo> {
  const { CapacitorHttp } = await import("@capacitor/core");
  const response = await CapacitorHttp.get({
    url,
    headers: { Accept: "application/json", "User-Agent": "StellaNow/1.0" },
  });
  if (response.status < 200 || response.status >= 300) throw new Error(String(response.status));
  const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
  return parseLiveStatus(data);
}

export async function refreshMemberLives(
  people: { slug: string; chzzk: string }[],
): Promise<Record<string, LiveInfo>> {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return fetchPublishedLive();

  const rows = await Promise.all(
    people.map(async (member) => {
      const channelId = member.chzzk.split("/").filter(Boolean).pop() ?? "";
      try {
        const info = await readChzzk(
          `https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`,
        );
        return [member.slug, info] as const;
      } catch {
        return null;
      }
    }),
  );
  const fresh = rows.filter((row): row is readonly [string, LiveInfo] => row !== null);
  if (fresh.length === 0) return fetchPublishedLive();
  return Object.fromEntries(fresh);
}
