export const units = [
  { id: "everys", name: "에버리스", en: "Everys", gen: 1 },
  { id: "universe", name: "유니버스", en: "Universe", gen: 2 },
  { id: "cliche", name: "클리셰", en: "Cliché", gen: 3 },
  { id: "abyss", name: "어비스", en: "ABYSS", gen: 4 },
] as const;

export type UnitId = (typeof units)[number]["id"];

export type Member = {
  slug: string;
  name: string;
  nameEn: string;
  unit: UnitId;
  birthday?: { month: number; day: number };
  fanName?: string;
  lore?: string;
  chzzk: string;
  youtube: string;
  x: string;
  profile?: string;
};

export const members: Member[] = [
  {
    slug: "yuni",
    name: "아야츠노 유니",
    nameEn: "Ayatsuno Yuni",
    unit: "everys",
    birthday: { month: 5, day: 21 },
    fanName: "아르냥",
    lore: "다른 유니콘들이 멸망을 향해 갈 때 홀로 봉인되어 있던 유니. 지구에서 눈을 뜨고 스텔라이브에 합류했다.",
    chzzk: "https://chzzk.naver.com/45e71a76e949e16a34764deb962f9d9f",
    youtube: "https://www.youtube.com/@ayatsunoyuni",
    x: "https://x.com/AyatsunoYuni",
    profile: "https://stellive.me/yuni",
  },
  {
    slug: "huya",
    name: "사키하네 후야",
    nameEn: "Sakihane Huya",
    unit: "everys",
    chzzk: "https://chzzk.naver.com/36ddb9bb4f17593b60f1b63cec86611d",
    youtube: "https://www.youtube.com/channel/UC0YQnenKBCu5sGb7H61n6HA",
    x: "https://x.com/SakihaneHuya",
  },
  {
    slug: "hina",
    name: "시라유키 히나",
    nameEn: "Shirayuki Hina",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/b044e3a3b9259246bc92e863e7d3f3b8",
    youtube: "https://www.youtube.com/@shirayukihina",
    x: "https://x.com/Shirayukihina_",
  },
  {
    slug: "mashiro",
    name: "네네코 마시로",
    nameEn: "Neneko Mashiro",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/4515b179f86b67b4981e16190817c580",
    youtube: "https://www.youtube.com/@neneko_mashiro",
    x: "https://x.com/NenekoMashiro",
  },
  {
    slug: "lize",
    name: "아카네 리제",
    nameEn: "Akane Lize",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/4325b1d5bbc321fad3042306646e2e50",
    youtube: "https://www.youtube.com/@akanelize",
    x: "https://x.com/AkaneLize",
  },
  {
    slug: "tabi",
    name: "아라하시 타비",
    nameEn: "Arahashi Tabi",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/a6c4ddb09cdb160478996007bff35296",
    youtube: "https://www.youtube.com/@arahashitabi",
    x: "https://x.com/ArahashiTabi",
  },
  {
    slug: "shibuki",
    name: "텐코 시부키",
    nameEn: "Tenko Shibuki",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/64d76089fba26b180d9c9e48a32600d9",
    youtube: "https://www.youtube.com/@tenkoshibuki",
    x: "https://x.com/TenkoShibuki",
  },
  {
    slug: "rin",
    name: "아오쿠모 린",
    nameEn: "Aokumo Rin",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/516937b5f85cbf2249ce31b0ad046b0f",
    youtube: "https://www.youtube.com/@aokumorin",
    x: "https://x.com/AokumoRin",
  },
  {
    slug: "nana",
    name: "하나코 나나",
    nameEn: "Hanako Nana",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/4d812b586ff63f8a2946e64fa860bbf5",
    youtube: "https://www.youtube.com/@hanako_nana",
    x: "https://x.com/HanakoNana_",
  },
  {
    slug: "riko",
    name: "유즈하 리코",
    nameEn: "Yuzuha Riko",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/8fd39bb8de623317de90654718638b10",
    youtube: "https://www.youtube.com/@yuzuhariko",
    x: "https://x.com/YuzuhaRiko",
  },
  {
    slug: "toa",
    name: "시즈키 토아",
    nameEn: "Shizuki Toa",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/2299fad4bebb504b0978e1ec08b2f7d3",
    youtube: "https://www.youtube.com/@ShizukiToa",
    x: "https://x.com/Shizukitoa_",
  },
  {
    slug: "rang",
    name: "코가네 랑",
    nameEn: "Cogane Rang",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/c657aa3592260a2b59669a72ec151936",
    youtube: "https://www.youtube.com/@coganerang",
    x: "https://x.com/Coganerang",
  },
  {
    slug: "hiyori",
    name: "하나요 히요리",
    nameEn: "Hanayo Hiyori",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/49d2c3cf8f0b2843d934ec15e82bb54c",
    youtube: "https://www.youtube.com/@HanayoHiyori",
    x: "https://x.com/hanayohiyori",
  },
  {
    slug: "mary",
    name: "토키노 메리",
    nameEn: "Tokino Mary",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/792acf9ca28b42918710327e14b06b68",
    youtube: "https://www.youtube.com/@TokinoMaryChannel",
    x: "https://x.com/TokinoMary",
  },
];

export function getMember(slug: string) {
  return members.find((member) => member.slug === slug);
}

export function chzzkLiveUrl(chzzk: string) {
  const channelId = chzzk.split("/").filter(Boolean).pop() ?? "";
  return `https://m.chzzk.naver.com/live/${channelId}`;
}

export function unitName(id: UnitId) {
  return units.find((unit) => unit.id === id)?.name ?? id;
}

export function unitNameEn(id: UnitId) {
  return units.find((unit) => unit.id === id)?.en ?? id;
}

export const fanartTags = [
  { slug: "yuni", tag: "#yunyart" },
  { slug: "huya", tag: "#huyart" },
  { slug: "hina", tag: "#_hinart" },
  { slug: "mashiro", tag: "#shiroart" },
  { slug: "lize", tag: "#Lize_art" },
  { slug: "tabi", tag: "#Tabiart" },
  { slug: "shibuki", tag: "#shibuki_art" },
  { slug: "rin", tag: "#kumorinart" },
  { slug: "nana", tag: "#Nanart_" },
  { slug: "riko", tag: "#riko_art" },
  { slug: "toa", tag: "#toart_" },
  { slug: "rang", tag: "#Rangart_" },
  { slug: "hiyori", tag: "#hiyoriart_" },
  { slug: "mary", tag: "#maryart_" },
] as const;

export function shortName(name: string) {
  const parts = name.split(" ");
  return parts[parts.length - 1] ?? name;
}

export const unitTone: Record<
  UnitId,
  { text: string; wash: string; surface: string }
> = {
  everys: { text: "#8d5a22", wash: "#f4e2c4", surface: "#fff8ee" },
  universe: { text: "#2c6286", wash: "#d7ebf6", surface: "#f3f9fd" },
  cliche: { text: "#8a4574", wash: "#f3dceb", surface: "#fdf6fa" },
  abyss: { text: "#1d6a5e", wash: "#d7f0ea", surface: "#f3fbf8" },
};
