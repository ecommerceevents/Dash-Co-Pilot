export default `
### START: INTERFACES ###
import { GridBlockDto } from "../../shared/grid/GridBlockUtils";

export type FeaturesBlockDto = {
  style: FeaturesBlockStyle;
  headline: string;
  subheadline: string;
  topText?: string;
  items: FeatureDto[];
  grid?: GridBlockDto;
};

export interface FeatureDto {
  name: string;
  description: string;
  img?: string; // SVG or image URL
  link?: {
    text: string;
    href: string;
    target?: string;
  };
}

export const FeaturesBlockStyles = [
  { value: "list", name: "List" },
  { value: "cards", name: "Cards" },
] as const;
export type FeaturesBlockStyle = (typeof FeaturesBlockStyles)[number]["value"];

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
  "features": {
    "style": "list",
  "headline": "Features Headline",
  "subheadline": "Features Subheadline",
  "topText": "Top text",
  "grid": {
    "columns": "3",
    "gap": "sm",
  },
  "items": [
    {
      "name": "Feature 1",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
      "img": '<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 32 32"> <path d="M 4 4 L 4 5 L 4 28 L 28 28 L 28 4 L 4 4 z M 6 6 L 26 6 L 26 10 L 6 10 L 6 6 z M 7 7 L 7 9 L 9 9 L 9 7 L 7 7 z M 10 7 L 10 9 L 12 9 L 12 7 L 10 7 z M 13 7 L 13 9 L 25 9 L 25 7 L 13 7 z M 6 12 L 26 12 L 26 26 L 6 26 L 6 12 z M 17.5 14 C 15.567 14 14 15.567 14 17.5 C 14 18.079 14.153344 18.617609 14.402344 19.099609 C 12.906344 20.636609 11.594969 21.990969 11.292969 22.292969 C 11.103969 22.481969 11 22.733 11 23 C 11 23.267 11.103969 23.518031 11.292969 23.707031 C 11.481969 23.896031 11.733 24 12 24 C 12.267 24 12.518031 23.896031 12.707031 23.707031 C 12.993031 23.421031 14.264484 22.18675 15.896484 20.59375 C 16.378484 20.84475 16.919 21 17.5 21 C 19.433 21 21 19.433 21 17.5 C 21 16.899 20.833406 16.341656 20.566406 15.847656 L 18 18.414062 L 16.585938 17 L 19.152344 14.433594 C 18.658344 14.166594 18.101 14 17.5 14 z"></path> </svg>',
      "link": { text: "shared.learnMore", href: "#" },
    },
    {
      "name": "Feature 2",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
      "img": '<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 32 32"> <path d="M 4 4 L 4 28 L 19.273438 28 C 18.475388 29.135328 18 30.512091 18 32 L 20 32 C 20 29.226334 22.226334 27 25 27 C 27.773666 27 30 29.226334 30 32 L 32 32 C 32 29.371676 30.478925 27.157432 28.326172 25.960938 C 28.784265 25.651654 29.250971 25.337329 29.634766 25.005859 C 30.71961 24.068918 31.488281 23.136719 31.488281 23.136719 L 32.005859 22.507812 L 31.496094 21.873047 C 31.496094 21.873047 30.746239 20.936055 29.667969 19.996094 C 29.179992 19.570709 28.617107 19.131891 28 18.767578 L 28 4 L 4 4 z M 6 6 L 26 6 L 26 10 L 6 10 L 6 6 z M 7 7 L 7 9 L 9 9 L 9 7 L 7 7 z M 10 7 L 10 9 L 12 9 L 12 7 L 10 7 z M 13 7 L 13 9 L 25 9 L 25 7 L 13 7 z M 6 12 L 26 12 L 26 18.037109 C 25.835538 18.016795 25.670308 18 25.5 18 C 23.026562 18 21 20.026562 21 22.5 C 21 23.690376 21.48732 24.763027 22.25 25.570312 C 21.963342 25.693691 21.689462 25.840998 21.423828 26 L 6 26 L 6 12 z M 25.5 20 C 26.216698 20 27.424286 20.693868 28.353516 21.503906 C 28.92056 21.998216 29.043908 22.183152 29.320312 22.494141 C 29.037323 22.806248 28.905535 22.995452 28.328125 23.494141 C 27.386719 24.307199 26.16357 25 25.5 25 C 24.107438 25 23 23.892562 23 22.5 C 23 21.107438 24.107438 20 25.5 20 z"></path> </svg>',
      "link": { text: "shared.learnMore", href: "#" },
    },
    {
      "name": "Feature 3",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
      "img": '<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 32 32"> <path d="M 16 3 C 12.144531 3 9 6.144531 9 10 L 9 13 L 6 13 L 6 29 L 26 29 L 26 13 L 23 13 L 23 10 C 23 6.144531 19.855469 3 16 3 Z M 16 5 C 18.773438 5 21 7.226563 21 10 L 21 13 L 11 13 L 11 10 C 11 7.226563 13.226563 5 16 5 Z M 8 15 L 24 15 L 24 27 L 8 27 Z M 12 20 C 11.449219 20 11 20.449219 11 21 C 11 21.550781 11.449219 22 12 22 C 12.550781 22 13 21.550781 13 21 C 13 20.449219 12.550781 20 12 20 Z M 16 20 C 15.449219 20 15 20.449219 15 21 C 15 21.550781 15.449219 22 16 22 C 16.550781 22 17 21.550781 17 21 C 17 20.449219 16.550781 20 16 20 Z M 20 20 C 19.449219 20 19 20.449219 19 21 C 19 21.550781 19.449219 22 20 22 C 20.550781 22 21 21.550781 21 21 C 21 20.449219 20.550781 20 20 20 Z"></path> </svg>',
      "link": { text: "shared.learnMore", href: "#" },
    },
  ],
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
