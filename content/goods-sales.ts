import sales from "@/content/goods-sales.json";

export type GoodsSale = {
  id: number;
  name: string;
  tag?: string;
  href: string;
  start: string | null;
  end: string | null;
  showStart: boolean;
};

const shop = "https://fanding.kr/@stellive/shop";

export const goodsSales = sales as GoodsSale[];

export function goodsEvents(rows: GoodsSale[] = goodsSales) {
  return [...group(rows, "start"), ...group(rows, "end")];
}

function group(rows: GoodsSale[], kind: "start" | "end") {
  const groups = new Map<string, { label: string; date: string; hrefs: string[] }>();
  for (const item of rows) {
    const date = kind === "start" ? (item.showStart ? item.start : null) : item.end;
    if (!date) continue;
    const label = item.tag || categoryFromName(item.name);
    const key = `${kind}|${date}|${label}`;
    const current = groups.get(key);
    if (current) current.hrefs.push(item.href);
    else groups.set(key, { label, date, hrefs: [item.href] });
  }
  return [...groups.values()].map((item) => event(item, kind));
}

function categoryFromName(name: string) {
  const words = name.split(" ");
  return words.length >= 3 ? words.slice(0, 2).join(" ") : name;
}

function event(item: { label: string; date: string; hrefs: string[] }, kind: "start" | "end") {
  const [year, month, day] = item.date.split("-").map(Number);
  return {
    id: `goods-${kind}-${item.date}-${item.label}`,
    year,
    month,
    day,
    title: `${item.label} 판매 ${kind === "start" ? "시작" : "종료"}`,
    href: item.hrefs.length === 1 ? item.hrefs[0] : shop,
  };
}
