import { getMember } from "@/content/members";
import { fandingShop, goods } from "@/content/goods";
import { schedule } from "@/content/schedule";
import { tracks } from "@/content/tracks";

export const metadata = { title: "게시물 · Stella Now" };

export default function PostsPage() {
  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">게시물</h1>
      <ul className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">
        {schedule.map((item) => (
          <li key={`s-${item.month}-${item.day}`}>
            <a href={item.href} className="block rounded-2xl border border-line px-4 py-4">
              <p className="text-xs font-medium text-violet">공지</p>
              <p className="mt-1 text-[15px] font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted">
                {item.month}월 {item.day}일
              </p>
            </a>
          </li>
        ))}
        {tracks.map((track) => {
          const member = getMember(track.memberSlug);
          if (!member) return null;
          return (
            <li key={track.title}>
              <a
                href={member.youtube}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-line px-4 py-4"
              >
                <p className="text-xs font-medium text-violet">음원</p>
                <p className="mt-1 text-[15px] font-medium">{track.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {member.name} · {track.date}
                </p>
              </a>
            </li>
          );
        })}
        {goods.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-line px-4 py-4"
            >
              <p className="text-xs font-medium text-violet">굿즈</p>
              <p className="mt-1 text-[15px] font-medium">{item.name}</p>
              <p className="mt-1 text-xs text-muted">{item.meta}</p>
            </a>
          </li>
        ))}
        <li className="md:col-span-2 lg:col-span-3">
          <a
            href={fandingShop}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center rounded-xl bg-violet text-sm font-medium text-white"
          >
            팬딩 스토어
          </a>
        </li>
      </ul>
    </div>
  );
}
