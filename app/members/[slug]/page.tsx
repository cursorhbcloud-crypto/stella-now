import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OshiButton } from "@/components/oshi-button";
import { getMember, members, unitName } from "@/content/members";

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

  const meta = [
    unitName(member.unit),
    member.birthday ? `${member.birthday.month}월 ${member.birthday.day}일` : null,
    member.fanName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="md:max-w-lg">
      <p className="text-sm text-muted">{member.nameEn}</p>
      <h1 className="mt-1 text-[32px] font-bold tracking-tight">{member.name}</h1>
      <p className="mt-2 text-sm text-muted">{meta}</p>
      {member.lore ? <p className="mt-5 text-sm leading-7 text-[#5c6270]">{member.lore}</p> : null}
      <div className="mt-6 space-y-2">
        <a
          href={member.chzzk}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-center rounded-xl bg-violet text-[15px] font-medium text-white"
        >
          방송 확인하기
        </a>
        <a
          href={member.youtube}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-center rounded-xl border border-line text-sm font-medium"
        >
          유튜브
        </a>
        {member.profile ? (
          <a
            href={member.profile}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center rounded-xl border border-line text-sm font-medium"
          >
            공식 프로필
          </a>
        ) : null}
        <div className="pt-2">
          <OshiButton slug={member.slug} />
        </div>
      </div>
    </article>
  );
}
