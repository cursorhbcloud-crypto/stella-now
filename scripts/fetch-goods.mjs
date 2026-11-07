import { readFileSync, writeFileSync } from "node:fs";

const outPath = new URL("../content/goods-sales.json", import.meta.url);
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

let previous = [];
try {
  const parsed = JSON.parse(readFileSync(outPath, "utf8"));
  if (Array.isArray(parsed)) previous = parsed;
} catch {
  previous = [];
}
const known = new Map(previous.map((item) => [item.id, item]));

try {
  const products = await fetchProducts();
  const next = [];
  for (const product of products) {
    const id = Number(product.iProductNo);
    const name = String(product.aTitle?.ko || product.aTitle?.en || "").replace(/\s+/g, " ").trim();
    const start = dateOnly(product.sSaleStartDatetime);
    const end = dateOnly(product.sSaleEndDatetime);
    if (!id || !name) continue;
    const saved = known.get(id);
    const upcoming = Boolean(start && start > today);
    const selling = Boolean(end && end >= today);
    if (!saved && !upcoming && !selling) continue;
    if (!start && !end) continue;
    const showStart = saved ? Boolean(saved.showStart) : previous.length > 0 ? Boolean(start) : upcoming;
    next.push({
      id,
      name,
      tag: saved?.tag || "",
      href: `https://fanding.kr/@stellive/shop/${id}/`,
      start,
      end,
      showStart,
    });
  }
  await Promise.all(
    next.filter((item) => !item.tag).map(async (item) => {
      item.tag = await productTag(item.id, item.name);
    }),
  );
  next.sort((a, b) => String(a.end ?? a.start).localeCompare(String(b.end ?? b.start)) || a.id - b.id);
  writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`goods: ${next.length}`);
} catch (error) {
  console.warn(`goods failed: ${error instanceof Error ? error.message : error}`);
}

async function productTag(id, name) {
  try {
    const response = await fetch(`https://fanding.kr/rest/product?iProductNo=${id}`, {
      headers: { "User-Agent": "StellaNow/1.0", Accept: "application/json" },
    });
    if (!response.ok) return categoryFromName(name);
    const tags = (await response.json())?.aData?.aProductData?.aTagList ?? [];
    const names = tags.map((tag) => tag?.ko).filter((tag) => typeof tag === "string" && tag.trim());
    return names.find((tag) => name.startsWith(tag)) || names[0] || categoryFromName(name);
  } catch {
    return categoryFromName(name);
  }
}

function categoryFromName(name) {
  const words = name.split(" ");
  return words.length >= 3 ? words.slice(0, 2).join(" ") : name;
}

function dateOnly(value) {
  if (typeof value !== "string" || value.length < 10) return null;
  return value.slice(0, 10);
}

async function fetchProducts() {
  const products = [];
  let last;
  for (let page = 0; page < 40; page += 1) {
    const url = new URL("https://fanding.kr/rest/product/list");
    url.searchParams.set("iCreatorNo", "3142");
    url.searchParams.set("iLimit", "20");
    url.searchParams.set("sSortOrder", "recent");
    if (last) url.searchParams.set("iLastProductNo", String(last));
    const response = await fetch(url, {
      headers: { "User-Agent": "StellaNow/1.0", Accept: "application/json" },
    });
    if (!response.ok) throw new Error(String(response.status));
    const list = (await response.json())?.aData?.aProductList ?? [];
    if (list.length === 0) break;
    products.push(...list);
    const nextLast = list.at(-1)?.iProductNo;
    if (!nextLast || nextLast === last) break;
    last = nextLast;
    if (list.length < 20) break;
  }
  if (products.length === 0) throw new Error("no products");
  return products;
}
