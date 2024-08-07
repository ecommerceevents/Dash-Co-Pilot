export type LogoCloudsBlockDto = {
  style: LogoCloudsBlockStyle;
  headline?: string;
  logos?: LogoCloudDto[];
};

export interface LogoCloudDto {
  src: string;
  srcDark?: string;
  alt: string;
  href: string;
}

export const LogoCloudsBlockStyles = [
  { value: "custom", name: "Custom" },
  { value: "simple", name: "Simple" },
  { value: "withBrand", name: "With Brand" },
] as const;
export type LogoCloudsBlockStyle = (typeof LogoCloudsBlockStyles)[number]["value"];

export const defaultLogoCloudsBlock: LogoCloudsBlockDto = {
  style: "simple",
  headline: "Logo Clouds Headline",
  logos: [
    {
      alt: "Tailwind CSS",
      href: "https://tailwindcss.com/ref=saasrock.com",
      src: "https://saasrock.com/build/_assets/tailwindcss-G3OQBAVI.png",
    },
    {
      alt: "Remix",
      href: "https://remix.run/ref=saasrock.com",
      src: "https://saasrock.com/build/_assets/remix-4ESNCVZ5.png",
      srcDark: "https://saasrock.com/build/_assets/remix-dark-U2ASPSOI.png",
    },
    {
      alt: "Prisma",
      href: "https://www.prisma.io/?via=alexandro",
      src: "https://saasrock.com/build/_assets/prisma-ATY77GXX.png",
      srcDark: "https://saasrock.com/build/_assets/prisma-dark-3FBYDJ4J.png",
    },
  ],
};
