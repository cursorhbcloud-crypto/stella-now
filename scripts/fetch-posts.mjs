import { readFileSync, writeFileSync, existsSync } from "node:fs";

const source = readFileSync(new URL("../content/members.ts", import.meta.url), "utf8");
const pairs = [...source.matchAll(/slug: "([^"]+)"[\s\S]*?x: "https:\/\/x\.com\/([^"]+)"/g)];
const names = [...source.matchAll(/slug: "([^"]+)",\s*name: "([^"]+)"/g)].map(([, slug, name]) => ({
  slug,
  name,
}));
const outPath = new URL("../content/posts.json", import.meta.url);
const previous = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : [];
const next = [];

for (const [, slug, handle] of pairs) {
  const kept = previous.filter((post) => post.memberSlug === slug && post.platform === "x");
  try {
    let text = await readTimeline(handle);
    let posts = parsePosts(text, slug);
    if (posts.length === 0) {
      text = await readTimeline(handle);
      posts = parsePosts(text, slug);
    }
    if (posts.length === 0) posts = await postsFromReplies(text, handle, slug);
    if (posts.length === 0) throw new Error("no timeline");
    next.push(...posts);
    console.log(`${slug}: ${posts.length} posts`);
  } catch (error) {
    next.push(...kept);
    console.warn(`posts failed for ${slug}: ${error instanceof Error ? error.message : error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 1200));
}

const keptFanding = previous.filter((post) => post.platform === "fanding");
try {
  const fanding = await fetchFanding(names);
  if (fanding.length === 0) throw new Error("no posts");
  next.push(...fanding);
  console.log(`fanding: ${fanding.length}`);
} catch (error) {
  next.push(...keptFanding);
  console.warn(`fanding posts failed: ${error instanceof Error ? error.message : error}`);
}

next.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`posts: ${next.length}`);

async function fetchFanding(memberNames) {
  const url = new URL("https://fanding.kr/rest/post_list");
  url.searchParams.set("sMemberUrl", "stellive");
  url.searchParams.set("iLimit", "12");
  url.searchParams.set("sSortOrder", "recent");
  url.searchParams.set("sVisibleOnlyOption", "T");
  const response = await fetch(url, {
    headers: { "User-Agent": "StellaNow/1.0", Accept: "application/json" },
  });
  if (!response.ok) throw new Error(String(response.status));
  const list = (await response.json())?.aData?.aPostList ?? [];
  return list
    .filter((post) => post?.aAuthInfo?.bIsLock === false && post.sTitle && post.sInsDatetime)
    .slice(0, 12)
    .map((post) => {
      const createdAt = new Date(`${String(post.sInsDatetime).replace(" ", "T")}+09:00`).toISOString();
      const title = String(post.sTitle).replace(/\s+/g, " ").trim();
      const memberSlug = memberForTitle(title, memberNames);
      return {
        id: `fanding-${post.iPostNo}`,
        platform: "fanding",
        ...(memberSlug ? { memberSlug } : {}),
        title,
        href: `https://fanding.kr/@stellive/post/${post.iPostNo}`,
        date: seoulLabel(createdAt),
        createdAt,
      };
    });
}

function memberForTitle(title, memberNames) {
  const hits = memberNames.filter((member) => title.includes(member.name));
  return hits.length === 1 ? hits[0].slug : undefined;
}

async function readTimeline(handle) {
  const response = await fetch(`https://r.jina.ai/https://x.com/${handle}`, {
    headers: {
    "User-Agent": "StellaNow/1.0",
    Accept: "text/plain",
    "X-With-Links-Summary": "true",
  },
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.text();
}

async function postsFromReplies(text, handle, slug) {
  const ids = [...new Set([...text.matchAll(/in_reply_to=(\d+)/g)].map((match) => match[1]))]
    .sort((a, b) => (BigInt(a) > BigInt(b) ? -1 : 1))
    .slice(0, 4);
  const posts = [];
  for (const id of ids) {
    const response = await fetch(`https://api.fxtwitter.com/${handle}/status/${id}`, {
      headers: { "User-Agent": "StellaNow/1.0" },
    });
    if (!response.ok) continue;
    const tweet = (await response.json())?.tweet;
    if (!tweet?.text || tweet.replying_to) continue;
    const createdAt = new Date(Number(tweet.created_timestamp) * 1000).toISOString();
    posts.push({
      id: String(tweet.id),
      platform: "x",
      memberSlug: slug,
      title: tweet.text.replace(/\s+/g, " ").trim(),
      href: tweet.url,
      date: seoulLabel(createdAt),
      createdAt,
    });
  }
  return posts;
}

function parsePosts(text, slug) {
  const seen = new Set();
  const posts = [];
  const pattern = /\[([^\]]+)\]\(https:\/\/x\.com\/([A-Za-z0-9_]+)\/status\/(\d+)\)\s+([\s\S]*?)\s+\[\d/gi;

  for (const match of text.matchAll(pattern)) {
    const account = match[2];
    const id = match[3];
    if (seen.has(id)) continue;
    const title = clean(match[4]);
    if (!title) continue;
    seen.add(id);
    const createdAt = snowflakeIso(id);
    posts.push({
      id,
      platform: "x",
      memberSlug: slug,
      title,
      href: `https://x.com/${account}/status/${id}`,
      date: seoulLabel(createdAt),
      createdAt,
    });
  }

  return posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 4);
}

function clean(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, (_, label) => (label.startsWith("http") ? "" : label))
    .replace(/\s+/g, " ")
    .trim();
}

function snowflakeIso(id) {
  const ms = Number((BigInt(id) >> 22n) + 1288834974657n);
  return new Date(ms).toISOString();
}

function seoulLabel(iso) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const value = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${Number(value("month"))}월 ${Number(value("day"))}일 ${value("hour")}:${value("minute")}`;
}
