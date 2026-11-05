import Link from "next/link";
import type { ReactNode } from "react";
import { getMember } from "@/content/members";
import { schedule } from "@/content/schedule";
import { tracks } from "@/content/tracks";

export default function HomePage() {
  return (
    <div>
      <div className="flex items-start justify-between md:hidden">
        <h1 className="text-[34px] font-bold leading-none tracking-tight sm:text-[40px]">Stella Now</h1>
        <Link href="/settings" aria-label="설정" className="grid size-10 place-items-center text-ink">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3.6v2.1M12 18.3v2.1M4.8 6.6l1.5 1.5M17.7 15.9l1.5 1.5M3.6 12h2.1M18.3 12h2.1M4.8 17.4l1.5-1.5M17.7 8.1l1.5-1.5" />
          </svg>
        </Link>
      </div>
      <p className="mt-2 text-[15px] text-muted md:mt-0">스텔라이브 최신 소식</p>

      <section className="mt-6 rounded-2xl border border-[#d9dde6] px-5 py-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#ef3b3b]">
          <span className="size-2 rounded-full bg-[#ef3b3b]" />
          LIVE
        </p>
        <h2 className="mt-3 text-[22px] font-bold leading-tight">멤버 방송 예정</h2>
        <p className="mt-2 text-sm text-muted">현재 방송 중인 멤버가 없습니다</p>
        <Link
          href="/members"
          className="mt-5 flex h-12 items-center justify-center rounded-xl bg-violet text-[15px] font-medium text-white md:max-w-xs"
        >
          방송 확인하기
        </Link>
      </section>

      <div className="md:grid md:grid-cols-2 md:gap-x-12">
      <Section title="공지사항" href="/calendar">
        {schedule.length === 0 ? (
          <Empty label="공지사항이 없습니다" />
        ) : (
          <ul className="space-y-3">
            {schedule.map((item) => (
              <li key={`${item.month}-${item.day}`}>
                <a href={item.href} className="block">
                  <p className="text-xs text-muted">
                    {item.month}월 {item.day}일
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium">{item.title}</p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="멤버 소식" href="/posts">
        {tracks.length === 0 ? (
          <Empty label="멤버 소식이 없습니다" />
        ) : (
          <ul className="space-y-3">
            {tracks.map((track) => {
              const member = getMember(track.memberSlug);
              return (
                <li key={track.title}>
                  <p className="text-xs text-muted">{track.date}</p>
                  <p className="mt-0.5 text-[15px] font-medium">{track.title}</p>
                  <p className="text-sm text-muted">{member?.name}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-9">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link href={href} className="text-sm font-medium text-violet">
          더보기
        </Link>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-[#c5c8d0]">{label}</p>;
}
