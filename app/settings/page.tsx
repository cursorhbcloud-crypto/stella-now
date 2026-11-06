"use client";

import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { useOshi } from "@/components/oshi";
import { ProfileAvatar } from "@/components/profile-avatar";
import { members, shortName } from "@/content/members";

const accounts = [
  { name: "X", href: "https://x.com/i/flow/login" },
  { name: "치지직", href: "https://nid.naver.com/nidlogin.login?url=https%3A%2F%2Fchzzk.naver.com%2F" },
  { name: "팬딩", href: "https://fanding.kr/my" },
];

const shortcuts = [
  { href: "/calendar", label: "일정", detail: "방송과 생일" },
  { href: "/goods", label: "굿즈", detail: "팬딩 상품" },
  { href: "/music", label: "음원", detail: "유튜브" },
];

export default function SettingsPage() {
  const { slug, choose, clear } = useOshi();
  const oshi = members.find((member) => member.slug === slug);
  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">설정</h1>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold">오시</h2>
          {oshi ? (
            <button type="button" onClick={clear} className="text-sm font-medium text-violet">
              해제
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-muted">
          {oshi ? `${oshi.name} 글을 게시물에서 먼저 보여요.` : "멤버를 고르면 그 글을 게시물에서 먼저 보여요."}
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          {members.map((member) => {
            const active = member.slug === slug;
            return (
              <li key={member.slug}>
                <button
                  type="button"
                  onClick={() => (active ? clear() : choose(member.slug))}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${
                    active ? "border-violet bg-[#f3f0ff] text-violet" : "border-line"
                  }`}
                >
                  <ProfileAvatar slug={member.slug} className="size-8" />
                  <span className="font-medium">{shortName(member.name)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">바로가기</h2>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {shortcuts.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex items-center justify-between px-4 py-3.5">
                <span className="font-medium">{item.label}</span>
                <span className="text-sm text-muted">{item.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">계정 연결</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          연결하면 그 계정 창만 따로 열리고 이 화면은 그대로입니다. 비밀번호는 저장하지 않습니다.
        </p>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {accounts.map((account) => (
            <li key={account.name} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="font-medium">{account.name}</span>
              <ExternalLink href={account.href} className="text-sm font-medium text-violet">
                연결
              </ExternalLink>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-8 text-sm leading-6 text-muted">
        팬이 만든 안내 페이지입니다. 방송은 치지직, 음원은 유튜브, 굿즈 결제와 재고는 팬딩에서
        이어집니다.
      </p>
    </div>
  );
}
