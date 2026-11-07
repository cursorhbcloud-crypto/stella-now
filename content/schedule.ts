import { goodsEvents } from "@/content/goods-sales";

export type ScheduleItem = {
  id?: string;
  month: number;
  day: number;
  title: string;
  href: string;
  year?: number;
  annual?: boolean;
};

export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

const planned: ScheduleItem[] = [
  {
    year: 2026,
    month: 11,
    day: 1,
    title: "팝업 종료",
    href: "https://stellive.me/",
  },
  {
    month: 5,
    day: 21,
    title: "유니 생일",
    href: "/members/yuni",
    annual: true,
  },
];

export const schedule: ScheduleItem[] = [...planned, ...goodsEvents()];

export function seoulToday(now = new Date()): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

export function dateValue(date: CalendarDate) {
  return date.year * 10000 + date.month * 100 + date.day;
}

export function occursOn(item: ScheduleItem, date: CalendarDate) {
  if (item.month !== date.month || item.day !== date.day) return false;
  if (item.annual || item.year == null) return true;
  return item.year === date.year;
}

export function occurrence(item: ScheduleItem, today: CalendarDate): CalendarDate {
  if (item.annual || item.year == null) {
    const thisYear = { year: today.year, month: item.month, day: item.day };
    if (dateValue(thisYear) >= dateValue(today)) return thisYear;
    return { year: today.year + 1, month: item.month, day: item.day };
  }
  return { year: item.year, month: item.month, day: item.day };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthCells(year: number, month: number): Array<CalendarDate & { inMonth: boolean }> {
  const start = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<CalendarDate & { inMonth: boolean }> = [];

  for (let index = 0; index < start; index += 1) {
    const date = new Date(Date.UTC(year, month - 1, 1 - (start - index)));
    cells.push({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= count; day += 1) {
    cells.push({ year, month, day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const date = new Date(Date.UTC(last.year, last.month - 1, last.day + 1));
    cells.push({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      inMonth: false,
    });
  }

  return cells;
}

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function weekdayLabel(date: CalendarDate) {
  const day = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
  return weekdays[day] ?? "";
}

export function dayDistance(from: CalendarDate, to: CalendarDate) {
  const start = Date.UTC(from.year, from.month - 1, from.day);
  const end = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((end - start) / 86400000);
}

export function relativeLabel(today: CalendarDate, date: CalendarDate) {
  const distance = dayDistance(today, date);
  if (distance === 0) return "오늘";
  if (distance === 1) return "내일";
  if (distance === -1) return "어제";
  if (distance > 1) return `D-${distance}`;
  return `${Math.abs(distance)}일 전`;
}
