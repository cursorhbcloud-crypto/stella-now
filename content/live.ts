import live from "@/content/live.json";

export type LiveInfo = {
  live: boolean;
  viewers: number;
  openDate: string | null;
};

type Stored = boolean | { live?: boolean; viewers?: number; openDate?: string | null };

const flags = live as Record<string, Stored>;

export function liveInfo(slug: string): LiveInfo {
  const value = flags[slug];
  if (typeof value === "object" && value) {
    return {
      live: value.live === true,
      viewers: value.viewers ?? 0,
      openDate: value.openDate ?? null,
    };
  }
  return { live: value === true, viewers: 0, openDate: null };
}

export function isLive(slug: string) {
  return liveInfo(slug).live;
}
