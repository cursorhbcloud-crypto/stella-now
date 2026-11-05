"use client";

import { members, shortName } from "@/content/members";
import { useOshi } from "@/components/oshi";

const accounts = [
  { name: "X", href: "https://x.com/i/flow/login" },
  { name: "치지직", href: "https://nid.naver.com/nidlogin.login?url=https%3A%2F%2Fchzzk.naver.com%2F" },
  { name: "팬딩", href: "https://fanding.kr/my" },
];

export default function SettingsPage() {
  const { slug, choose } = useOshi();

  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">설정</h1>
      <section className="mt-6">
        <h2 className="text-lg font-bold">오시</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          {members.map((member) => {
            const active = member.slug === slug;
            return (
              <li key={member.slug}>
                <button
                  type="button"
                  onClick={() => choose(member.slug)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${
                    active ? "border-violet bg-[#f3f0ff] text-violet" : "border-line"
                  }`}
                >
                  <span className="font-medium">{shortName(member.name)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-bold">로그인</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          X, 치지직, 팬딩은 각각 그 서비스 화면에서 로그인합니다. 비밀번호는 Stella Now에 저장되지 않습니다.
        </p>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {accounts.map((account) => (
            <li key={account.name}>
              <a href={account.href} target="_blank" rel="noreferrer" className="flex items-center justify-between px-4 py-3.5">
                <span className="font-medium">{account.name}</span>
                <span className="text-sm text-violet">로그인</span>
              </a>
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
