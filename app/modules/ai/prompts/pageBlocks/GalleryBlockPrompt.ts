export default `
### START: INTERFACES ###
export type GalleryBlockDto = {
  style: GalleryBlockStyle;
  topText?: string;
  headline?: string;
  subheadline?: string;
  items: { type: string; title: string; src: string }[];
};

export const GalleryBlockStyles = [{ value: "carousel", name: "List" }] as const;
export type GalleryBlockStyle = (typeof GalleryBlockStyles)[number]["value"];
### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "gallery": {
      "style": "carousel",
      "topText": "Top text",
      "headline": "Gallery Headline",
      "subheadline": "Gallery Subheadline",
      "items": [
        {
          "type": "image",
          "title": "Image 1",
          "src": "https://via.placeholder.com/1000x600?text=Image%201",
        },
        {
          "type": "image",
          "title": "Image 2",
          "src": "https://via.placeholder.com/1000x600?text=Image%202",
        },
      ],
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
