"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useOshi } from "@/components/oshi";
import { ProfileAvatar } from "@/components/profile-avatar";
import { members, shortName } from "@/content/members";

const ACCOUNT_KEY = "stella-now-accounts";
const ACCOUNT_VERSION = "stella-now-accounts-v2";

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
  const { signedIn, asking, signIn, confirm, cancel, signOut } = useAccounts();

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
        <h2 className="text-lg font-bold">로그인</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          로그인 화면에서 로그인한 뒤 돌아오면 로그인했는지 확인합니다. 비밀번호는 저장하지 않습니다.
        </p>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {accounts.map((account) => {
            const on = signedIn[account.name] === true;
            const waiting = asking === account.name;
            return (
              <li key={account.name} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3.5">
                <span className="font-medium">{account.name}</span>
                {on ? (
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-medium text-violet">로그인됨</span>
                    <button type="button" onClick={() => signOut(account.name)} className="text-sm text-muted">
                      로그아웃
                    </button>
                  </span>
                ) : waiting ? (
                  <span className="flex items-center gap-3">
                    <span className="text-sm text-muted">로그인했나요?</span>
                    <button type="button" onClick={() => confirm(account.name)} className="text-sm font-medium text-violet">
                      했어요
                    </button>
                    <button type="button" onClick={cancel} className="text-sm text-muted">
                      안 했어요
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => signIn(account)} className="text-sm font-medium text-violet">
                    로그인
                  </button>
                )}
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

function useAccounts() {
  const [signedIn, setSignedIn] = useState<Record<string, boolean>>({});
  const [asking, setAsking] = useState<string | null>(null);
  const pending = useRef<string | null>(null);
  const openedAt = useRef(0);
  const left = useRef(false);

  useEffect(() => {
    setSignedIn(readAccounts());
    function returned() {
      if (!left.current || !pending.current) return;
      if (Date.now() - openedAt.current < 1200) {
        left.current = false;
        return;
      }
      left.current = false;
      const name = pending.current;
      pending.current = null;
      setAsking(name);
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") left.current = true;
      if (document.visibilityState === "visible") returned();
    }
    function onBlur() {
      if (pending.current) left.current = true;
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", returned);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", returned);
    };
  }, []);

  function signIn(account: (typeof accounts)[number]) {
    pending.current = account.name;
    openedAt.current = Date.now();
    setAsking(null);
    window.open(account.href, "_blank", "noopener");
  }

  function confirm(name: string) {
    setAsking(null);
    setSignedIn((current) => {
      const next = { ...current, [name]: true };
      window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      window.localStorage.setItem(ACCOUNT_VERSION, "1");
      return next;
    });
  }

  function cancel() {
    pending.current = null;
    setAsking(null);
  }

  function signOut(name: string) {
    setSignedIn((current) => {
      const next = { ...current, [name]: false };
      window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { signedIn, asking, signIn, confirm, cancel, signOut };
}

function readAccounts() {
  try {
    if (window.localStorage.getItem(ACCOUNT_VERSION) !== "1") {
      window.localStorage.removeItem(ACCOUNT_KEY);
      window.localStorage.setItem(ACCOUNT_VERSION, "1");
      return {};
    }
    const raw = JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) || "{}") as Record<string, unknown>;
    return Object.fromEntries(Object.entries(raw).map(([name, value]) => [name, value === true]));
  } catch {
    return {};
  }
}
