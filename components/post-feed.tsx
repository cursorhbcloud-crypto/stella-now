"use client";

import { useEffect, useMemo, useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { members } from "@/content/members";
import { posts, type Post, type PostPlatform } from "@/content/posts";
import { saveRemoteFile } from "@/lib/save-file";
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
  const [viewer, setViewer] = useState<MediaFile | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function save(file: MediaFile) {
    try {
      await saveRemoteFile(file.fileUrl, file.filename);
      setNotice("저장을 시작했어요");
    } catch {
      window.open(file.fileUrl, "_blank", "noopener");
      setNotice("저장 화면을 열었어요");
    }
    window.setTimeout(() => setNotice(null), 2000);
  }

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
            <PostRow key={post.id} post={post} onOpen={setViewer} onSave={(file) => void save(file)} />
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

      {notice ? <p className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white">{notice}</p> : null}

      {viewer ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4" onClick={() => setViewer(null)}>
          <img src={viewer.src} alt="" className="max-h-[80%] max-w-full object-contain" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void save(viewer);
            }}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-ink"
          >
            저장
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PostRow({
  post,
  onOpen,
  onSave,
}: {
  post: Post;
  onOpen: (file: MediaFile) => void;
  onSave: (file: MediaFile) => void;
}) {
  const name = members.find((item) => item.slug === post.memberSlug)?.name;
  const pictures = mediaFiles(post);

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
                <div key={picture.src} className="relative overflow-hidden rounded-xl">
                  <button type="button" onClick={() => onOpen(picture)} className="block w-full">
                    <img
                      src={previewSrc(picture.src)}
                      alt=""
                      className={pictures.length > 1 ? "aspect-square w-full object-cover" : "max-h-80 w-full object-cover"}
                    />
                  </button>
                  {picture.video ? (
                    <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                      영상
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onSave(picture)}
                    className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                  >
                    저장
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {post.platform === "x" && /^\d+$/.test(post.id) ? (
            <div className="mt-3 flex gap-2">
              <a
                href={`https://x.com/intent/retweet?tweet_id=${post.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#f2f3f7] px-3 py-1.5 text-sm font-medium"
              >
                리트윗
              </a>
              <a
                href={`https://x.com/intent/like?tweet_id=${post.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#f2f3f7] px-3 py-1.5 text-sm font-medium"
              >
                하트
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

type MediaFile = { src: string; fileUrl: string; filename: string; video: boolean };

function mediaFiles(post: Post): MediaFile[] {
  const images = (post.images ?? []).map((src) => ({
    src,
    fileUrl: src,
    filename: fileName(src, "jpg"),
    video: false,
  }));
  if (!post.videoPoster) return images;
  const fileUrl = post.videoUrl || post.videoPoster;
  return [
    ...images,
    {
      src: post.videoPoster,
      fileUrl,
      filename: post.videoUrl ? fileName(post.videoUrl, "mp4") : fileName(post.videoPoster, "jpg"),
      video: true,
    },
  ];
}

function fileName(url: string, fallbackExt: string) {
  const name = url.split("?")[0]?.split("/").pop() || `stella-now.${fallbackExt}`;
  return name.includes(".") ? name : `${name}.${fallbackExt}`;
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
