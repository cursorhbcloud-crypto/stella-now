import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(new URL("../content/members.ts", import.meta.url), "utf8");
const pairs = [...source.matchAll(/slug: "([^"]+)"[\s\S]*?chzzk: "https:\/\/chzzk\.naver\.com\/([^"]+)"/g)];
const outPath = new URL("../content/live.json", import.meta.url);
const next = {};

for (const [, slug, channelId] of pairs) {
  next[slug] = { live: false, viewers: 0, openDate: null };
  try {
    const response = await fetch(
      `https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`,
      { headers: { "User-Agent": "StellaNow/1.0" } },
    );
    if (!response.ok) throw new Error(String(response.status));
    const content = (await response.json())?.content ?? {};
    const live = content.status === "OPEN" && !content.closeDate;
    next[slug] = {
      live,
      viewers: live ? Number(content.concurrentUserCount) || 0 : 0,
      openDate: live && typeof content.openDate === "string" ? content.openDate : null,
    };
  } catch (error) {
    console.warn(`live status failed for ${slug}: ${error instanceof Error ? error.message : error}`);
  }
}

writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`);
const onAir = Object.entries(next)
  .filter(([, info]) => info.live)
  .map(([slug]) => slug);
console.log(onAir.length ? `live: ${onAir.join(", ")}` : "nobody live");
