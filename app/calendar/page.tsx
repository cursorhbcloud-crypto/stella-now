import Link from "next/link";
import { schedule } from "@/content/schedule";

export const metadata = { title: "일정 · Stella Now" };

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">일정</h1>
      {schedule.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#c5c8d0]">공지사항이 없습니다</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line md:grid md:max-w-3xl md:grid-cols-2 md:gap-3 md:divide-y-0 md:border-0">
          {schedule.map((item) => (
            <li key={`${item.month}-${item.day}`}>
              {item.href.startsWith("/") ? (
                <Link href={item.href} className="block py-4 md:rounded-2xl md:border md:border-line md:px-4">
                  <p className="text-xs text-muted">
                    {item.month}월 {item.day}일
                  </p>
                  <p className="mt-1 text-[15px] font-medium">{item.title}</p>
                </Link>
              ) : (
                <a href={item.href} className="block py-4 md:rounded-2xl md:border md:border-line md:px-4">
                  <p className="text-xs text-muted">
                    {item.month}월 {item.day}일
                  </p>
                  <p className="mt-1 text-[15px] font-medium">{item.title}</p>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
