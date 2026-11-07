import data from "@/content/posts.json";
import { members, shortName } from "@/content/members";

export type PostPlatform = "fanding" | "cafe" | "x";

export type Post = {
  id: string;
  platform: PostPlatform;
  memberSlug?: string;
  title: string;
  href: string;
  date: string;
  createdAt: string;
  images?: string[];
  videoPoster?: string;
  videoUrl?: string;
  replyTo?: string;
  author?: string;
  fanart?: boolean;
};

export const posts = data as Post[];

export function replyTargetLabel(handle: string) {
  const member = members.find((item) => item.x.split("/").pop()?.toLowerCase() === handle.toLowerCase());
  return member ? shortName(member.name) : `@${handle}`;
}

export function replyText(title: string, replyTo?: string) {
  if (!replyTo) return title;
  const escaped = replyTo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return title.replace(new RegExp(`^@${escaped}\\s+`, "i"), "").trim();
}
