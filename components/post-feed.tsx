"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOshi } from "@/components/oshi";
import { ProfileAvatar } from "@/components/profile-avatar";
import { fanartTags, members, shortName } from "@/content/members";
import { posts, type Post, type PostPlatform } from "@/content/posts";
import { saveRemoteFile } from "@/lib/save-file";
import { fetchOwnPosts, fetchTaggedPosts } from "@/lib/x-timeline";

const platforms = [
  { id: "all", label: "전체" },
  { id: "fanding", label: "팬딩" },
  { id: "x", label: "X" },
] as const;

type PlatformFilter = (typeof platforms)[number]["id"];
type Mark = { like: boolean; repost: boolean };

const REACTIONS = "stella-now-reactions";

export function PostFeed() {
  const { slug: oshi } = useOshi();
  const appliedOshi = useRef(false);
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [member, setMember] = useState("all");
  const [tag, setTag] = useState("all");
  const [fresh, setFresh] = useState<Post[]>([]);
  const [cursors, setCursors] = useState<Record<string, string | null>>({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewer, setViewer] = useState<MediaFile | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, Mark>>({});

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
    const slug = new URLSearchParams(window.location.search).get("member");
    if (!slug || !members.some((item) => item.slug === slug)) return;
    appliedOshi.current = true;
    setMember(slug);
  }, []);

  useEffect(() => {
    if (appliedOshi.current || !oshi) return;
    appliedOshi.current = true;
    setMember(oshi);
  }, [oshi]);

  useEffect(() => {
    setMarks(readMarks());
  }, []);

  useEffect(() => {
    if (tag === "all") return;
    const slug = fanartTags.find((item) => item.tag === tag)?.slug;
    let stop = false;
    void fetchTaggedPosts(tag, slug).then((found) => {
      if (!stop && found.length > 0) setFresh((current) => [...current, ...found]);
    });
    return () => {
      stop = true;
    };
  }, [tag]);

  function toggleMark(id: string, kind: keyof Mark) {
    setMarks((current) => {
      const prev = current[id] ?? { like: false, repost: false };
      const next = { ...current, [id]: { ...prev, [kind]: !prev[kind] } };
      window.localStorage.setItem(REACTIONS, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    let cancel = false;
    void loadPages(members, {}).then((page) => {
      if (cancel) return;
      setFresh((current) => mergePosts(page.posts, current));
      setCursors(page.cursors);
      setLoaded(true);
    });
    return () => {
      cancel = true;
    };
  }, []);

  const feed = useMemo(() => mergePosts(posts, fresh), [fresh]);
  const counts = useMemo(() => {
    const scoped = feed.filter((post) => matchesScope(post, member, tag));
    return {
      all: scoped.length,
      fanding: scoped.filter((post) => post.platform === "fanding").length,
      x: scoped.filter((post) => post.platform === "x").length,
    };
  }, [feed, member, tag]);

  const visible = feed.filter((post) => {
    if (!matchesScope(post, member, tag)) return false;
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
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <div className="flex items-start justify-between">
        <h1 className="text-[32px] font-bold tracking-tight">게시물</h1>
        <Link href="/settings" aria-label="설정" className="grid size-10 place-items-center text-ink md:hidden">
          <GearIcon />
        </Link>
      </div>
      <p className="mt-1 text-[15px] text-muted">스텔라이브 최신 소식</p>

      <p className="mt-6 text-sm text-muted">플랫폼</p>
      <div className="mt-3 flex flex-wrap gap-2">
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
      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip active={member === "all"} label="전체" onClick={() => setMember("all")} />
        {members.map((item) => (
          <FilterChip
            key={item.slug}
            active={member === item.slug}
            label={item.name}
            onClick={() => {
              setMember(item.slug);
              setTag("all");
            }}
          />
        ))}
      </div>

      <p className="mt-5 text-sm text-muted">팬아트</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip active={tag === "all"} label="전체" onClick={() => setTag("all")} />
        {fanartTags.map((item) => (
          <FilterChip
            key={item.tag}
            active={tag === item.tag}
            label={`${shortName(members.find((member) => member.slug === item.slug)?.name ?? item.slug)} ${item.tag}`}
            onClick={() => {
              setTag(item.tag);
              setMember("all");
            }}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#b0b4be]">{tag === "all" ? "게시물이 없습니다" : `가져온 글에는 ${tag} 가 없습니다`}</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {visible.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              mark={marks[post.id]}
              onToggle={toggleMark}
              onOpen={setViewer}
              onSave={(file) => void save(file)}
            />
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
        <div className="fixed inset-0 z-[80] flex flex-col bg-black" onClick={() => setViewer(null)}>
          <div className="flex min-h-0 flex-1 items-center justify-center px-3">
            <img
              src={viewer.src}
              alt=""
              className="h-auto w-auto max-h-[calc(100dvh-5rem)] max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void save(viewer);
            }}
            className="mb-[max(16px,env(safe-area-inset-bottom))] self-center rounded-full bg-white px-5 py-2 text-sm font-medium text-ink"
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
  mark,
  onToggle,
  onOpen,
  onSave,
}: {
  post: Post;
  mark?: Mark;
  onToggle: (id: string, kind: keyof Mark) => void;
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
            {post.replyTo ? <span className="mt-1 block break-words text-sm text-muted">@{post.replyTo}에게 답글</span> : null}
            <span className="mt-1 block break-words text-[15px] leading-6">{post.title}</span>
          </a>
          {pictures.length > 0 ? (
            <div className={`mt-2 grid gap-1 ${pictures.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {pictures.map((picture) => (
                <div key={picture.src} className="relative overflow-hidden rounded-xl">
                  <button type="button" onClick={() => onOpen(picture)} className="block w-full">
                    <img src={previewSrc(picture.src)} alt="" className="block h-auto w-full max-w-full" />
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
            <div className="mt-3 flex flex-wrap gap-2">
              <MarkButton pressed={mark?.repost === true} label="리트윗" onClick={() => onToggle(post.id, "repost")} />
              <MarkButton pressed={mark?.like === true} label="하트" heart onClick={() => onToggle(post.id, "like")} />
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

function matchesScope(post: Post, member: string, tag: string) {
  if (tag !== "all") return hasTag(post.title, tag);
  return member === "all" || post.memberSlug === member;
}

function hasTag(title: string, tag: string) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\w가-힣])${escaped}(?![\\w가-힣])`, "i").test(title);
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

function MarkButton({
  pressed,
  label,
  heart = false,
  onClick,
}: {
  pressed: boolean;
  label: string;
  heart?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
        pressed ? (heart ? "bg-[#ffecec] text-[#ef3b3b]" : "bg-[#f3f0ff] text-violet") : "bg-[#f2f3f7] text-ink"
      }`}
    >
      {heart ? <HeartIcon filled={pressed} /> : <RepostIcon active={pressed} />}
      {label}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 19.4 4.8 12.5a4.2 4.2 0 0 1 6-5.9L12 7.7l1.2-1.1a4.2 4.2 0 0 1 6 5.9z" strokeLinejoin="round" />
    </svg>
  );
}

function RepostIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 4h3v3" />
      <path d="M20 7A8 8 0 0 0 6.2 6.2" />
      <path d="M7 20H4v-3" />
      <path d="M4 17a8 8 0 0 0 13.8 1.8" />
    </svg>
  );
}

function readMarks() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(REACTIONS) || "{}") as Record<string, Partial<Mark>>;
    return Object.fromEntries(
      Object.entries(raw).map(([id, mark]) => [id, { like: mark.like === true, repost: mark.repost === true }]),
    );
  } catch {
    return {};
  }
}

function platformLabel(platform: PostPlatform) {
  return platform === "fanding" ? "팬딩" : "X";
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.6v2.1M12 18.3v2.1M4.8 6.6l1.5 1.5M17.7 15.9l1.5 1.5M3.6 12h2.1M18.3 12h2.1M4.8 17.4l1.5-1.5M17.7 8.1l1.5-1.5" />
    </svg>
  );
}
