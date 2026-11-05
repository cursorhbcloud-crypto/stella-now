export type ScheduleItem = {
  month: number;
  day: number;
  title: string;
  href: string;
};

export const schedule: ScheduleItem[] = [
  {
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
  },
];
