import data from "@/content/posts.json";

export type PostPlatform = "fanding" | "x";

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
};

export const posts = data as Post[];
