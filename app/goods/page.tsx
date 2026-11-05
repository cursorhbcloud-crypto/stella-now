import type { Metadata } from "next";
import { fandingShop, goods } from "@/content/goods";

export const metadata: Metadata = { title: "굿즈 · Stella Now" };

export default function GoodsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl tracking-tight">굿즈</h1>
        <a
          href={fandingShop}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-ink px-3.5 py-1.5 text-sm text-paper"
        >
          팬딩 스토어
        </a>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {goods.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-[0_8px_20px_rgba(48,36,18,0.04)] hover:border-gold/50"
            >
              <span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                    item.ended ? "bg-paper text-muted" : "bg-gold-soft text-gold"
                  }`}
                >
                  {item.ended ? "종료" : "팬딩"}
                </span>
                <span className={`mt-4 block text-lg ${item.ended ? "text-muted" : ""}`}>
                  {item.name}
                </span>
                <span className="mt-1 block text-sm text-muted">{item.meta}</span>
              </span>
              <span className="mt-8 text-sm text-gold">{item.ended ? "기록" : "보기"}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
