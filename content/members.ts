export const units = [
  { id: "everys", name: "에버리스" },
  { id: "universe", name: "유니버스" },
  { id: "cliche", name: "클리셰" },
  { id: "abyss", name: "어비스" },
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
    profile: "https://stellive.me/yuni",
  },
  {
    slug: "huya",
    name: "사키하네 후야",
    nameEn: "Sakihane Huya",
    unit: "everys",
    chzzk: "https://chzzk.naver.com/36ddb9bb4f17593b60f1b63cec86611d",
    youtube: "https://www.youtube.com/channel/UC0YQnenKBCu5sGb7H61n6HA",
  },
  {
    slug: "hina",
    name: "시라유키 히나",
    nameEn: "Shirayuki Hina",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/b044e3a3b9259246bc92e863e7d3f3b8",
    youtube: "https://www.youtube.com/@shirayukihina",
  },
  {
    slug: "mashiro",
    name: "네네코 마시로",
    nameEn: "Neneko Mashiro",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/4515b179f86b67b4981e16190817c580",
    youtube: "https://www.youtube.com/@neneko_mashiro",
  },
  {
    slug: "lize",
    name: "아카네 리제",
    nameEn: "Akane Lize",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/4325b1d5bbc321fad3042306646e2e50",
    youtube: "https://www.youtube.com/@akanelize",
  },
  {
    slug: "tabi",
    name: "아라하시 타비",
    nameEn: "Arahashi Tabi",
    unit: "universe",
    chzzk: "https://chzzk.naver.com/a6c4ddb09cdb160478996007bff35296",
    youtube: "https://www.youtube.com/@arahashitabi",
  },
  {
    slug: "shibuki",
    name: "텐코 시부키",
    nameEn: "Tenko Shibuki",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/64d76089fba26b180d9c9e48a32600d9",
    youtube: "https://www.youtube.com/@tenkoshibuki",
  },
  {
    slug: "rin",
    name: "아오쿠모 린",
    nameEn: "Aokumo Rin",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/516937b5f85cbf2249ce31b0ad046b0f",
    youtube: "https://www.youtube.com/@aokumorin",
  },
  {
    slug: "nana",
    name: "하나코 나나",
    nameEn: "Hanako Nana",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/4d812b586ff63f8a2946e64fa860bbf5",
    youtube: "https://www.youtube.com/@hanako_nana",
  },
  {
    slug: "riko",
    name: "유즈하 리코",
    nameEn: "Yuzuha Riko",
    unit: "cliche",
    chzzk: "https://chzzk.naver.com/8fd39bb8de623317de90654718638b10",
    youtube: "https://www.youtube.com/@yuzuhariko",
  },
  {
    slug: "toa",
    name: "시즈키 토아",
    nameEn: "Shizuki Toa",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/2299fad4bebb504b0978e1ec08b2f7d3",
    youtube: "https://www.youtube.com/@ShizukiToa",
  },
  {
    slug: "rang",
    name: "코가네 랑",
    nameEn: "Cogane Rang",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/c657aa3592260a2b59669a72ec151936",
    youtube: "https://www.youtube.com/@coganerang",
  },
  {
    slug: "hiyori",
    name: "하나요 히요리",
    nameEn: "Hanayo Hiyori",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/49d2c3cf8f0b2843d934ec15e82bb54c",
    youtube: "https://www.youtube.com/@HanayoHiyori",
  },
  {
    slug: "mary",
    name: "토키노 메리",
    nameEn: "Tokino Mary",
    unit: "abyss",
    chzzk: "https://chzzk.naver.com/792acf9ca28b42918710327e14b06b68",
    youtube: "https://www.youtube.com/@TokinoMaryChannel",
  },
];

export function getMember(slug: string) {
  return members.find((member) => member.slug === slug);
}

export function unitName(id: UnitId) {
  return units.find((unit) => unit.id === id)?.name ?? id;
}

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
