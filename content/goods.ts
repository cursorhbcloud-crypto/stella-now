export type Good = {
  name: string;
  meta: string;
  href: string;
  ended?: boolean;
};

export const goods: Good[] = [
  {
    name: "상시 판매",
    meta: "응원봉을 포함한 상시 상품",
    href: "https://fanding.kr/@stellive/section/16237/",
  },
  {
    name: "페스티벌 굿즈",
    meta: "행사",
    href: "https://fanding.kr/@stellive/section/19455/",
  },
  {
    name: "메탈 샤프",
    meta: "종료",
    href: "https://fanding.kr/@stellive/shop/2993/",
    ended: true,
  },
];

export const fandingShop = "https://fanding.kr/@stellive/shop";
