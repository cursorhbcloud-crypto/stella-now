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
    let posts = [];
    let lastError = new Error("no timeline");
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        posts = await fetchOwnPosts(handle, slug);
        if (posts.length === 0) throw new Error("no timeline");
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
    if (lastError) throw lastError;
    next.push(...posts);
    console.log(`${slug}: ${posts.length} posts`);
  } catch (error) {
    next.push(...kept);
    console.warn(`posts failed for ${slug}: ${error instanceof Error ? error.message : error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 400));
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
      const image = post.sPostThumbnailUrl;
      return {
        id: `fanding-${post.iPostNo}`,
        platform: "fanding",
        ...(memberSlug ? { memberSlug } : {}),
        title,
        href: `https://fanding.kr/@stellive/post/${post.iPostNo}`,
        date: seoulLabel(createdAt),
        createdAt,
        ...(image ? { images: [image] } : {}),
      };
    });
}

function memberForTitle(title, memberNames) {
  const hits = memberNames.filter((member) => title.includes(member.name));
  return hits.length === 1 ? hits[0].slug : undefined;
}

async function fetchOwnPosts(handle, slug) {
  const posts = [];
  let cursor;
  for (let page = 0; page < 2 && posts.length < 12; page += 1) {
    const url = new URL(`https://api.fxtwitter.com/2/profile/${handle}/statuses`);
    url.searchParams.set("with_replies", "1");
    if (cursor) url.searchParams.set("cursor", cursor);
    const response = await fetch(url, {
      headers: { "User-Agent": "StellaNow/1.0", Accept: "application/json" },
    });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    for (const tweet of data.results ?? []) {
      const post = toPost(tweet, handle, slug);
      if (post) posts.push(post);
    }
    cursor = data.cursor?.bottom;
    if (!cursor) break;
  }
  return posts;
}

function toPost(tweet, handle, slug) {
  const author = tweet.author?.screen_name ?? "";
  if (tweet.reposted_by || author.toLowerCase() !== handle.toLowerCase() || !tweet.text || !tweet.id) return null;
  const createdAt = new Date(Number(tweet.created_timestamp) * 1000).toISOString();
  const images = (tweet.media?.photos ?? []).map((photo) => photo.url).filter(Boolean);
  const video = tweet.media?.videos?.[0];
  const videoPoster = video?.thumbnail_url;
  const mp4 = (video?.formats ?? []).filter((format) => format.container === "mp4" && format.url);
  const videoUrl = mp4.at(-1)?.url || (video?.url?.includes(".mp4") ? video.url : undefined);
  const replyTo = tweet.replying_to?.screen_name;
  return {
    id: String(tweet.id),
    platform: "x",
    memberSlug: slug,
    title: String(tweet.text).replace(/\s+/g, " ").trim(),
    href: tweet.url || `https://x.com/${author}/status/${tweet.id}`,
    date: seoulLabel(createdAt),
    createdAt,
    ...(images.length ? { images } : {}),
    ...(videoPoster ? { videoPoster } : {}),
    ...(videoUrl ? { videoUrl } : {}),
    ...(replyTo ? { replyTo } : {}),
  };
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
