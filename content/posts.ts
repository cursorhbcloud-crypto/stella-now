export type PostPlatform = "cafe" | "x";

export type Post = {
  id: string;
  platform: PostPlatform;
  memberSlug?: string;
  title: string;
  href: string;
  date: string;
};

export const posts: Post[] = [];
