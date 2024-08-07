export default `
### START: INTERFACES ###

import { SocialsBlockDto } from "~/modules/pageBlocks/components/blocks/shared/socials/SocialsBlockDto";
import { defaultSocials } from "~/modules/pageBlocks/utils/defaultSocials";

export type FooterBlockDto = {
  style: FooterBlockStyle;
  text?: string;
  sections: FooterSectionDto[];
  socials?: SocialsBlockDto;
};

export interface FooterSectionDto {
  name: string;
  items: { name: string; href: string }[];
}

export const FooterBlockStyles = [
  { value: "simple", name: "Simple" },
  { value: "columns", name: "Columns" },
] as const;
export type FooterBlockStyle = (typeof FooterBlockStyles)[number]["value"];
export interface SocialsBlockDto {
  instagram?: string;
  twitter?: string;
  github?: string;
  discord?: string;
  twitterCreator?: string;
}

### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "footer": {
    "style": "columns",
  "text": "Footer text",
  "sections": [
    {
      "name": "Application",
      "items": [
        { "name": "Pricing", href: "/pricing" },
        { "name": "Sign in", href: "/login" },
        { "name": "Sign up", href: "/register" },
        { "name": "Blog", href: "/blog" },
      ],
    },
    {
      "name": "Product",
      "items": [
        { "name": "Contact", href: "/contact" },
        { "name": "Newsletter", href: "/newsletter" },
        { "name": "Terms and Conditions", href: "/terms-and-conditions" },
        { "name": "Privacy Policy", href: "/privacy-policy" },
      ],
    },
  ],
  "socials": defaultSocials,
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
