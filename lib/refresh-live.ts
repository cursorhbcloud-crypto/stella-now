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

function channelIdOf(chzzk: string) {
  return chzzk.split("/").filter(Boolean).pop() ?? "";
}

const liveTimeout = 8000;

function withTimeout<T>(work: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), liveTimeout);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function readChzzkDirect(url: string): Promise<LiveInfo> {
  const { CapacitorHttp } = await import("@capacitor/core");
  const response = await withTimeout(
    CapacitorHttp.get({
      url,
      headers: { Accept: "application/json", "User-Agent": "StellaNow/1.0" },
    }),
  );
  if (response.status < 200 || response.status >= 300) throw new Error(String(response.status));
  const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
  return parseLiveStatus(data);
}

async function readChzzkPage(channelId: string): Promise<LiveInfo> {
  const response = await fetch(`/chzzk-live/${channelId}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(liveTimeout),
  });
  if (!response.ok) throw new Error(String(response.status));
  return parseLiveStatus(await response.json());
}

async function readMembers(
  people: { slug: string; chzzk: string }[],
  read: (channelId: string) => Promise<LiveInfo>,
  onUpdate?: (slug: string, info: LiveInfo) => void,
) {
  const rows = await Promise.all(
    people.map(async (member) => {
      try {
        const info = await read(channelIdOf(member.chzzk));
        onUpdate?.(member.slug, info);
        return [member.slug, info] as const;
      } catch {
        return null;
      }
    }),
  );
  return rows.filter((row): row is readonly [string, LiveInfo] => row !== null);
}

export async function refreshMemberLives(
  people: { slug: string; chzzk: string }[],
  onUpdate?: (slug: string, info: LiveInfo) => void,
): Promise<Record<string, LiveInfo>> {
  const { Capacitor } = await import("@capacitor/core");
  const fresh = Capacitor.isNativePlatform()
    ? await readMembers(
        people,
        (channelId) => readChzzkDirect(`https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`),
        onUpdate,
      )
    : await readMembers(people, readChzzkPage, onUpdate);
  // A failed request must not mark anyone offline. Only a real Chzzk answer replaces the snapshot.
  if (fresh.length === 0) return fetchPublishedLive();
  return Object.fromEntries(fresh);
}
