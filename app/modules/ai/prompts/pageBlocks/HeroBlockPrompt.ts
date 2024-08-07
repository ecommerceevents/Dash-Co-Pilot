export default `
### START: INTERFACES ###
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
    target?: string;
  }[];
  bottomText?: TextWithLinkDto;
};

export const HeroBlockStyles = [
  { value: "simple", name: "simple" },
  { value: "rightImage", name: "rightImage" },
  { value: "topImage", name: "topImage" },
  { value: "bottomImage", name: "bottomImage" },
] as const;
export type HeroBlockStyle = (typeof HeroBlockStyles)[number]["value"];

interface TextWithLinkDto {
  text?: string;
  link?: {
    text?: string;
    href?: string;
    target?: string;
  };
}
### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{ 
  "hero": {
    "style": "simple",
    "headline": "Hero Headline",
    "description": "Hero Description",
    "image": "https://via.placeholder.com/720x600?text=Your%20Hero%20Image",
    "topText": {
      "text": "Top text",
      "link": { "text": "Link", "href": "#" },
    },
    cta: [
      { "text": "Primary CTA", "href": "#", "isPrimary": true },
      { "text": "Secondary CTA", "href": "#", "isPrimary": false },
    ],
    "bottomText": {
      "text": "Bottom text",
      "link": { "text": "Link", "href": "#" },
    }
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
