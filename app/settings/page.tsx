"use client";

import { members, shortName } from "@/content/members";
import { useOshi } from "@/components/oshi";

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
      <p className="mt-8 text-sm leading-6 text-muted">
        팬이 만든 안내 페이지입니다. 방송은 치지직, 음원은 유튜브, 굿즈 결제와 재고는 팬딩에서
        이어집니다.
      </p>
    </div>
  );
}
