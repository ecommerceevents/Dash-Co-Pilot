export type BannerBlockDto = {
  style: BannerBlockStyle;
  text?: string;
  textMd?: string;
  href?: string;
  target?: undefined | "_blank";
  icon?: string;
  cta: {
    text: string;
    href: string;
    target?: undefined | "_blank";
    isPrimary?: boolean;
    icon?: string;
  }[];
};

export const BannerBlockStyles = [
  { value: "top", name: "Top" },
  { value: "bottom", name: "Bottom" },
] as const;
export type BannerBlockStyle = (typeof BannerBlockStyles)[number]["value"];

export const defaultBannerBlock: BannerBlockDto = {
  style: "top",
  text: "Banner",
  textMd: "Banner after md: breakpoint",
  cta: [
    { text: "CTA 1", href: "#" },
    {
      text: "CTA 2",
      href: "#",
    },
  ],
};
