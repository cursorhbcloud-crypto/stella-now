import type { Post } from "@/content/posts";

type Tweet = {
  id?: string;
  url?: string;
  text?: string;
  created_timestamp?: number;
  replying_to?: { screen_name?: string } | null;
  reposted_by?: unknown;
  author?: { screen_name?: string };
  media?: {
    photos?: { url?: string }[];
    videos?: { thumbnail_url?: string; url?: string; formats?: { container?: string; url?: string }[] }[];
  };
};

export async function fetchTaggedPosts(tag: string, slug?: string) {
  const url = new URL("https://api.fxtwitter.com/2/search");
  url.searchParams.set("q", tag);
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: Tweet[] };
    return (data.results ?? []).flatMap((tweet) => {
      const post = toTaggedPost(tweet, tag, slug);
      return post ? [post] : [];
    });
  } catch {
    return [];
  }
}

export async function fetchOwnPosts(handle: string, slug: string, cursor?: string) {
  const url = new URL(`https://api.fxtwitter.com/2/profile/${handle}/statuses`);
  url.searchParams.set("with_replies", "1");
  if (cursor) url.searchParams.set("cursor", cursor);
  let response = await fetch(url);
  if (!response.ok) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    response = await fetch(url);
  }
  if (!response.ok) throw new Error(String(response.status));
  const data = (await response.json()) as { results?: Tweet[]; cursor?: { bottom?: string } };
  const posts = (data.results ?? []).flatMap((tweet) => {
    const post = toPost(tweet, handle, slug);
    return post ? [post] : [];
  });
  return { posts, cursor: data.cursor?.bottom };
}

function toTaggedPost(tweet: Tweet, tag: string, slug?: string): Post | null {
  if (!tweet.text || !tweet.id || tweet.reposted_by) return null;
  const title = tweet.text.replace(/\s+/g, " ").trim();
  if (!new RegExp(`(?:^|[^\\w가-힣])${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w가-힣])`, "i").test(title)) return null;
  const stamp = Number(tweet.created_timestamp);
  const created = Number.isFinite(stamp) ? new Date(stamp * 1000) : new Date();
  const createdAt = Number.isNaN(created.getTime()) ? new Date().toISOString() : created.toISOString();
  const author = tweet.author?.screen_name ?? "";
  const images = (tweet.media?.photos ?? []).map((photo) => photo.url).filter((url): url is string => Boolean(url));
  const video = tweet.media?.videos?.[0];
  const videoPoster = video?.thumbnail_url;
  const videoUrl = mp4Url(video);
  return {
    id: String(tweet.id),
    platform: "x",
    ...(slug ? { memberSlug: slug } : {}),
    title,
    href: tweet.url || (author ? `https://x.com/${author}/status/${tweet.id}` : `https://x.com/i/status/${tweet.id}`),
    date: seoulLabel(createdAt),
    createdAt,
    ...(images.length ? { images } : {}),
    ...(videoPoster ? { videoPoster } : {}),
    ...(videoUrl ? { videoUrl } : {}),
  };
}

function toPost(tweet: Tweet, handle: string, slug: string): Post | null {
  const author = tweet.author?.screen_name ?? "";
  if (tweet.reposted_by || author.toLowerCase() !== handle.toLowerCase() || !tweet.text || !tweet.id) return null;
  const createdAt = new Date(Number(tweet.created_timestamp) * 1000).toISOString();
  const images = (tweet.media?.photos ?? []).map((photo) => photo.url).filter((url): url is string => Boolean(url));
  const video = tweet.media?.videos?.[0];
  const videoPoster = video?.thumbnail_url;
  const videoUrl = mp4Url(video);
  const replyTo = tweet.replying_to?.screen_name;
  return {
    id: String(tweet.id),
    platform: "x",
    memberSlug: slug,
    title: tweet.text.replace(/\s+/g, " ").trim(),
    href: tweet.url || `https://x.com/${author}/status/${tweet.id}`,
    date: seoulLabel(createdAt),
    createdAt,
    ...(images.length ? { images } : {}),
    ...(videoPoster ? { videoPoster } : {}),
    ...(videoUrl ? { videoUrl } : {}),
    ...(replyTo ? { replyTo } : {}),
  };
}

function mp4Url(video: { url?: string; formats?: { container?: string; url?: string }[] } | undefined) {
  const files = (video?.formats ?? []).filter((format) => format.container === "mp4" && format.url);
  return files.at(-1)?.url || (video?.url?.includes(".mp4") ? video.url : undefined);
}

function seoulLabel(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${Number(value("month"))}월 ${Number(value("day"))}일 ${value("hour")}:${value("minute")}`;
}
