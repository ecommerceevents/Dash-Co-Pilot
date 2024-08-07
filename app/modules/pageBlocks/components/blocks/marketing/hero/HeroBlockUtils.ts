export type HeroBlockDto = {
  style: HeroBlockStyle;
  headline: string;
  description: string;
  topText?: TextWithLinkDto;
  image?: string;
  cta: {
    text: string;
    href: string;
    isPrimary: boolean;
    target?: undefined | "_blank";
  }[];
  bottomText?: TextWithLinkDto;
};

export const HeroBlockStyles = [
  { value: "simple", name: "Simple" },
  { value: "rightImage", name: "Right Image" },
  { value: "bottomImage", name: "Bottom Image" },
  { value: "topImage", name: "Top Image" },
] as const;
export type HeroBlockStyle = (typeof HeroBlockStyles)[number]["value"];

interface TextWithLinkDto {
  text?: string;
  link?: {
    text?: string;
    href?: string;
    target?: undefined | "_blank";
  };
}

export const defaultHeroBlock: HeroBlockDto = {
  style: "simple",
  headline: "Hero Headline",
  description: "Hero Description",
  image: "https://via.placeholder.com/720x600?text=Your%20Hero%20Image",
  topText: {
    text: "Top text",
    link: { text: "Link", href: "#" },
  },
  cta: [
    { text: "Primary CTA", href: "#", isPrimary: true },
    { text: "Secondary CTA", href: "#", isPrimary: false },
  ],
  bottomText: {
    text: "Bottom text",
    link: { text: "Link", href: "#" },
  },
};
