export default `
### START: INTERFACES ###
export type BannerBlockDto = {
  style: BannerBlockStyle;
  text: string;
  cta: {
    text: string;
    href: string;
    isPrimary?: boolean;
  }[];
};

export const BannerBlockStyles = [
  { value: "top", name: "Top" },
  { value: "bottom", name: "Bottom" },
] as const;
export type BannerBlockStyle = (typeof BannerBlockStyles)[number]["value"];
### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "banner": {
    {
      "style": "top",
      "text": "Banner",
      "cta": [
        { "text": "CTA 1", href: "#" },
        {
          "text": "CTA 2",
          href: "#",
        },
      ],
    }
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
