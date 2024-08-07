import { GridBlockDto } from "../../shared/grid/GridBlockUtils";

export type CommunityBlockDto = {
  style: CommunityBlockStyle;
  headline: string;
  subheadline: string;
  cta: { text: string; href: string }[];
  type?: "manual" | "github";
  withName: boolean;
  grid?: GridBlockDto;
  data?: {
    members: { user: string; avatar_url: string; url?: string }[];
  };
};

export const CommunityBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type CommunityBlockStyle = (typeof CommunityBlockStyles)[number]["value"];

export const defaultCommunityBlock: CommunityBlockDto = {
  style: "simple",
  headline: "Community Headline",
  subheadline: "Community Subheadline",
  type: "manual",
  withName: true,
  grid: {
    columns: "3",
    gap: "sm",
  },
  cta: [
    {
      text: "Twitter",
      href: "https://twitter.com/intent/follow?screen_name=saas_rock",
    },
    {
      text: "YouTube",
      href: "https://youtube.com/@saasrock",
    },
    {
      text: "Discord",
      href: "https://discord.gg/KMkjU2BFn9",
    },
  ],
  data: {
    members: [
      {
        user: "Michael Jackson",
        avatar_url: "https://avatars.githubusercontent.com/u/92839?v=4",
      },
      {
        user: "Alexandro Martinez",
        avatar_url: "https://avatars.githubusercontent.com/u/8606530?v=4",
      },
      {
        user: "Ryan Florence",
        avatar_url: "https://avatars.githubusercontent.com/u/100200?v=4",
      },
    ],
  },
};
