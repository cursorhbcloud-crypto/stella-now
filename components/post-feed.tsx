"use client";

import { useEffect, useMemo, useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { members } from "@/content/members";
import { posts, type Post, type PostPlatform } from "@/content/posts";
import { fetchOwnPosts } from "@/lib/x-timeline";

const platforms = [
  { id: "all", label: "전체" },
  { id: "fanding", label: "팬딩" },
  { id: "x", label: "X" },
] as const;

type PlatformFilter = (typeof platforms)[number]["id"];

export function PostFeed() {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [member, setMember] = useState("all");
  const [fresh, setFresh] = useState<Post[]>([]);
  const [cursors, setCursors] = useState<Record<string, string | null>>({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    void loadPages(members, {}).then((page) => {
      if (cancel) return;
      setFresh(page.posts);
      setCursors(page.cursors);
      setLoaded(true);
    });
    return () => {
      cancel = true;
    };
  }, []);

  const feed = useMemo(() => mergePosts(posts, fresh), [fresh]);
  const counts = useMemo(() => {
    const scoped = feed.filter((post) => member === "all" || post.memberSlug === member);
    return {
      all: scoped.length,
      fanding: scoped.filter((post) => post.platform === "fanding").length,
      x: scoped.filter((post) => post.platform === "x").length,
    };
  }, [feed, member]);

  const visible = feed.filter((post) => {
    if (member !== "all" && post.memberSlug !== member) return false;
    if (platform !== "all" && post.platform !== platform) return false;
    return true;
  });

  const historyTargets = members.filter((item) => member === "all" || item.slug === member);
  const canLoadMore = loaded && platform !== "fanding" && historyTargets.some((item) => cursors[item.slug]);
  const historyEnded = loaded && platform !== "fanding" && historyTargets.every((item) => cursors[item.slug] === null);

  async function loadMore() {
    const targets = historyTargets.filter((item) => cursors[item.slug]);
    if (targets.length === 0 || loading) return;
    setLoading(true);
    const page = await loadPages(targets, cursors);
    setFresh((current) => [...current, ...page.posts]);
    setCursors((current) => ({ ...current, ...page.cursors }));
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">게시물</h1>
      <p className="mt-1 text-[15px] text-muted">스텔라이브 최신 소식</p>

      <p className="mt-6 text-sm text-muted">플랫폼</p>
      <div className="mt-3 flex gap-2">
        {platforms.map((item) => (
          <FilterChip
            key={item.id}
            active={platform === item.id}
            label={`${item.label} (${counts[item.id]})`}
            onClick={() => setPlatform(item.id)}
          />
        ))}
      </div>

      <p className="mt-5 text-sm text-muted">멤버</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden">
        <FilterChip active={member === "all"} label="전체" onClick={() => setMember("all")} />
        {members.map((item) => (
          <FilterChip
            key={item.slug}
            active={member === item.slug}
            label={item.name}
            onClick={() => setMember(item.slug)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#b0b4be]">게시물이 없습니다</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {visible.map((post) => (
            <PostRow key={post.id} post={post} onOpen={setPhoto} />
          ))}
        </ul>
      )}

      {canLoadMore ? (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loading}
          className="mt-4 w-full py-3 text-[15px] font-medium text-violet disabled:text-muted"
        >
          {loading ? "불러오는 중" : "이전 게시물 더 보기"}
        </button>
      ) : null}
      {historyEnded ? <p className="mt-4 text-center text-sm text-muted">마지막 게시물입니다</p> : null}

      {photo ? (
        <button
          type="button"
          aria-label="닫기"
          onClick={() => setPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <img src={photo} alt="" className="max-h-full max-w-full object-contain" />
        </button>
      ) : null}
    </div>
  );
}

function PostRow({ post, onOpen }: { post: Post; onOpen: (src: string) => void }) {
  const name = members.find((item) => item.slug === post.memberSlug)?.name;
  const pictures = [
    ...(post.images ?? []).map((src) => ({ src, video: false })),
    ...(post.videoPoster ? [{ src: post.videoPoster, video: true }] : []),
  ];

  return (
    <li className="py-4">
      <div className="flex gap-3">
        {post.memberSlug ? <ProfileAvatar slug={post.memberSlug} className="size-10" /> : null}
        <div className="min-w-0 flex-1">
          <a href={post.href} target="_blank" rel="noreferrer" className="block">
            <span className="block text-sm">
              <span className="font-medium">{name ?? platformLabel(post.platform)}</span>
              <span className="text-muted"> · {post.date}</span>
            </span>
            {post.replyTo ? <span className="mt-1 block text-sm text-muted">@{post.replyTo}에게 답글</span> : null}
            <span className="mt-1 block text-[15px] leading-6">{post.title}</span>
          </a>
          {pictures.length > 0 ? (
            <div className={`mt-2 grid gap-1 ${pictures.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {pictures.map((picture) => (
                <button
                  key={picture.src}
                  type="button"
                  onClick={() => onOpen(picture.src)}
                  className="relative overflow-hidden rounded-xl"
                >
                  <img
                    src={previewSrc(picture.src)}
                    alt=""
                    className={pictures.length > 1 ? "aspect-square w-full object-cover" : "max-h-80 w-full object-cover"}
                  />
                  {picture.video ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                      영상
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

async function loadPages(targets: { slug: string; x: string }[], cursors: Record<string, string | null>) {
  const posts: Post[] = [];
  const next: Record<string, string | null> = {};
  await Promise.all(
    targets.map(async (item) => {
      const handle = item.x.split("/").filter(Boolean).pop() ?? "";
      try {
        const page = await fetchOwnPosts(handle, item.slug, cursors[item.slug] || undefined);
        posts.push(...page.posts);
        next[item.slug] = page.cursor ?? null;
      } catch {
        if (cursors[item.slug]) next[item.slug] = cursors[item.slug];
      }
    }),
  );
  return { posts, cursors: next };
}

function mergePosts(saved: Post[], incoming: Post[]) {
  const map = new Map(saved.map((post) => [post.id, post]));
  for (const post of incoming) map.set(post.id, { ...map.get(post.id), ...post });
  return [...map.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function previewSrc(src: string) {
  return src.replace("name=orig", "name=small");
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium ${
        active ? "bg-violet text-white" : "bg-[#f2f3f7] text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function platformLabel(platform: PostPlatform) {
  return platform === "fanding" ? "팬딩" : "X";
}
