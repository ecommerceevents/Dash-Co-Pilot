export type GalleryBlockDto = {
  style: GalleryBlockStyle;
  topText?: string;
  headline?: string;
  subheadline?: string;
  items: GalleryItemDto[];
};
export type GalleryItemDto = { type: string; title: string; src: string };
export const GalleryBlockStyles = [{ value: "carousel", name: "List" }] as const;
export type GalleryBlockStyle = (typeof GalleryBlockStyles)[number]["value"];

export const defaultGalleryBlock: GalleryBlockDto = {
  style: "carousel",
  topText: "Top text",
  headline: "Gallery Headline",
  subheadline: "Gallery Subheadline",
  items: [
    {
      type: "image",
      title: "Image 1",
      src: "https://via.placeholder.com/1000x600?text=Image%201",
    },
    {
      type: "image",
      title: "Image 2",
      src: "https://via.placeholder.com/1000x600?text=Image%202",
    },
  ],
};
