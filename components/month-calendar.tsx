"use client";

import { useState } from "react";
import { schedule, type ScheduleItem } from "@/content/schedule";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function MonthCalendar({ year, month }: { year: number; month: number }) {
  const first = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  const inMonth = schedule.filter((item) => item.month === month);
  const [selected, setSelected] = useState<number | null>(inMonth[0]?.day ?? null);
  const chosen = inMonth.find((item) => item.day === selected);

  return (
    <div>
      <h1 className="font-serif text-5xl tracking-tight">
        {year}년 {month}월
      </h1>
      <div className="mt-8 rounded-[28px] border border-line bg-card p-4 shadow-[0_12px_30px_rgba(48,36,18,0.04)] sm:p-6">
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {weekdays.map((day) => (
          <div key={day} className="text-muted">
            {day}
          </div>
        ))}
        {Array.from({ length: first }, (_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          const marked = inMonth.some((item) => item.day === day);
          const isSelected = day === selected;
          return (
            <div key={day} className="flex justify-center">
              <button
                type="button"
                onClick={() => setSelected(day)}
                aria-pressed={isSelected}
                className={`flex size-8 items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-ink text-paper"
                    : marked
                      ? "text-gold"
                      : "text-ink hover:text-gold"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
      </div>
      {chosen ? <DayDetail item={chosen} /> : null}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {schedule.map((item) => (
          <li key={`${item.month}-${item.day}`}>
            <a
              href={item.href}
              className="block rounded-2xl border border-line bg-card px-5 py-4 shadow-[0_8px_20px_rgba(48,36,18,0.04)] hover:border-gold/50"
            >
              <p className="font-serif text-2xl">
                {item.month}/{item.day}
              </p>
              <p className="mt-2 text-sm">{item.title}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DayDetail({ item }: { item: ScheduleItem }) {
  return (
    <a
      href={item.href}
      className="mt-4 block rounded-2xl border border-gold/30 bg-gold-soft px-5 py-4 hover:bg-[#f0d7ae]"
    >
      <p className="text-xs text-gold">
        {item.month}월 {item.day}일
      </p>
      <p className="mt-1 text-sm">{item.title}</p>
    </a>
  );
}
