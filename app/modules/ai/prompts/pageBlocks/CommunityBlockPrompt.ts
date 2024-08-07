export default `
### START: INTERFACES ###


import { GridBlockDto } from "../../shared/grid/GridBlockUtils";

export type CommunityBlockDto = {
  style: CommunityBlockStyle;
  headline: string;
  subheadline: string;
  cta: { text: string; href: string }[];
  type: "manual" | "github";
  withName: boolean;
  grid?: GridBlockDto;
  data?: {
    members: { user: string; avatar_url: string }[];
  };
};

export const CommunityBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type CommunityBlockStyle = (typeof CommunityBlockStyles)[number]["value"];

export const gridCols = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
export const gaps = ["none", "xs", "sm", "md", "lg"] as const;
export interface GridBlockDto {
  columns?: (typeof gridCols)[number];
  gap?: (typeof gaps)[number];
}
### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "community": {
    "style": "simple",
  "headline": "Community Headline",
  "subheadline": "Community Subheadline",
  "type": "manual",
  "withName": true,
  "grid": {
    "columns": "3",
    "gap": "sm",
  },
  "cta": [
    {
      "text": "Twitter",
      "href": "https://twitter.com/saas_rock",
    },
    {
      "text": "YouTube",
      "href": "https://youtube.com/@saasrock",
    },
    {
      "text": "Discord",
      "href": "https://discord.gg/KMkjU2BFn9",
    },
  ],
  "data": {
    "members": [
      {
        "user": "Michael Jackson",
        "avatar_url": "https://avatars.githubusercontent.com/u/92839?v=4",
      },
      {
        "user": "Alexandro Martinez",
        "avatar_url": "https://avatars.githubusercontent.com/u/8606530?v=4",
      },
      {
        "user": "Ryan Florence",
        "avatar_url": "https://avatars.githubusercontent.com/u/100200?v=4",
      },
    ],
  },
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
