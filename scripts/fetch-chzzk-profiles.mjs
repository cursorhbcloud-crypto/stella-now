import { readFileSync, writeFileSync, existsSync } from "node:fs";

const source = readFileSync(new URL("../content/members.ts", import.meta.url), "utf8");
const pairs = [...source.matchAll(/slug: "([^"]+)"[\s\S]*?chzzk: "https:\/\/chzzk\.naver\.com\/([^"]+)"/g)];
const outPath = new URL("../content/chzzk-profiles.json", import.meta.url);
const previous = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};
const next = { ...previous };

for (const [, slug, channelId] of pairs) {
  try {
    const response = await fetch(`https://api.chzzk.naver.com/service/v1/channels/${channelId}`, {
      headers: { "User-Agent": "StellaNow/1.0" },
    });
    if (!response.ok) throw new Error(String(response.status));
    const body = await response.json();
    const image = body?.content?.channelImageUrl;
    if (typeof image === "string" && image.startsWith("https://")) next[slug] = image;
    else console.warn(`no image for ${slug}`);
  } catch (error) {
    console.warn(`chzzk profile failed for ${slug}: ${error instanceof Error ? error.message : error}`);
  }
}

writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`saved ${Object.keys(next).length} chzzk profiles`);
