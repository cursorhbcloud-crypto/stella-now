import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveMark } from "@/components/live-mark";
import { OshiButton } from "@/components/oshi-button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { liveInfo } from "@/content/live";
import { chzzkLiveUrl, getMember, members, shortName, unitName, unitTone, units } from "@/content/members";
import { posts } from "@/content/posts";
import { tracks } from "@/content/tracks";

export function generateStaticParams() {
  return members.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getMember(slug);
  return { title: member ? `${member.name} · Stella Now` : "Stella Now" };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getMember(slug);
  if (!member) notFound();

  const unit = units.find((item) => item.id === member.unit);
  const tone = unitTone[member.unit];
  const live = liveInfo(member.slug);
  const notes = memberPosts(member.slug);
  const songs = tracks.filter((track) => track.memberSlug === member.slug);
  const mates = members.filter((item) => item.unit === member.unit && item.slug !== member.slug);

  return (
    <article>
      <Link href="/members" className="text-sm font-medium text-muted">
        멤버
      </Link>

      <div className="mt-4 md:grid md:grid-cols-[minmax(0,340px)_1fr] md:items-start md:gap-x-12">
        <div>
          <header className="rounded-3xl px-5 py-6" style={{ background: tone.surface }}>
            <div className="flex items-start gap-4">
              <span className="relative">
                <ProfileAvatar slug={member.slug} className="size-24 ring-4 ring-white" />
                {live.live ? (
                  <span className="absolute right-1 top-1 size-3.5 rounded-full border-2 border-white bg-[#ef3b3b]" />
                ) : null}
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium text-violet">{member.nameEn}</p>
                <h1 className="mt-1 flex flex-wrap items-center gap-2 text-[28px] font-bold leading-tight tracking-tight">
                  {member.name}
                  {live.live ? <LiveMark /> : null}
                </h1>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: tone.wash, color: tone.text }}>
                    {unit?.gen}기 · {unitName(member.unit)}
                  </span>
                  {member.birthday ? (
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#5c6270]">
                      생일 {member.birthday.month}월 {member.birthday.day}일
                    </span>
                  ) : null}
                  {member.fanName ? (
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#5c6270]">
                      팬네임 {member.fanName}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {live.live ? (
              <a
                href={chzzkLiveUrl(member.chzzk)}
                className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-[#ef3b3b]">지금 방송 중</span>
                <span className="text-xs text-muted">시청 {live.viewers.toLocaleString("ko-KR")}명</span>
              </a>
            ) : null}
          </header>

          {member.lore ? (
            <p className="mt-4 rounded-2xl border border-line px-4 py-4 text-sm leading-7 text-[#5c6270]">{member.lore}</p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Tile href={chzzkLiveUrl(member.chzzk)} label="치지직" primary />
            <Tile href={member.youtube} label="유튜브" external />
            <Tile href={member.x} label="X" external wide={!member.profile || member.unit === "abyss"} />
            {member.profile && member.unit !== "abyss" ? <Tile href={member.profile} label="공식 프로필" external /> : null}
          </div>

          <div className="mt-2">
            <OshiButton slug={member.slug} />
          </div>
        </div>

        <div className="mt-8 md:mt-0">
          {songs.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold">음원</h2>
              <ul className="mt-3 space-y-2">
                {songs.map((track) => (
                  <li key={track.title}>
                    <a href={member.youtube} target="_blank" rel="noreferrer" className="block rounded-2xl bg-[#f2f3f7] px-4 py-3">
                      <p className="text-[15px] font-medium">{track.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{track.date}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className={songs.length > 0 ? "mt-8" : ""}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">최근 글</h2>
              <Link href={`/posts?member=${member.slug}`} className="text-sm font-medium text-violet">
                더보기
              </Link>
            </div>
            {notes.length === 0 ? (
              <p className="mt-3 text-sm text-muted">아직 가져온 글이 없습니다</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {notes.map((post) => {
                  const thumb = previewSrc(post.images?.[0] ?? post.videoPoster);
                  return (
                    <li key={post.id}>
                      <a href={post.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-[#f2f3f7] px-3 py-3">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="size-16 shrink-0 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        ) : null}
                        <span className="min-w-0">
                          <span className="block text-[11px] text-muted">
                            {post.platform === "fanding" ? "팬딩" : "X"} · {post.date}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-sm leading-5">{post.title}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {mates.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold">같은 기수</h2>
              <ul className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {mates.map((mate) => (
                  <li key={mate.slug}>
                    <Link href={`/members/${mate.slug}`} className="flex w-16 flex-col items-center gap-2">
                      <ProfileAvatar slug={mate.slug} className="size-14" />
                      <span className="w-full truncate text-center text-xs">{shortName(mate.name)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Tile({
  href,
  label,
  primary = false,
  external = false,
  wide = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
  external?: boolean;
  wide?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`flex h-12 items-center justify-center rounded-xl text-sm font-medium ${wide ? "col-span-2" : ""} ${
        primary ? "bg-violet text-white" : "border border-line bg-white"
      }`}
    >
      {label}
    </a>
  );
}

function memberPosts(slug: string) {
  const own = posts
    .filter((post) => post.memberSlug === slug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const notes = own.filter((post) => !post.replyTo);
  return (notes.length >= 3 ? notes : own).slice(0, 4);
}

function previewSrc(src?: string) {
  if (!src) return null;
  return src.includes("name=orig") ? src.replace("name=orig", "name=small") : src;
}
