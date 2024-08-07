export type VideoBlockDto = {
  style: VideoBlockStyle;
  headline?: string;
  subheadline?: string;
  src: string;
};

export const VideoBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type VideoBlockStyle = (typeof VideoBlockStyles)[number]["value"];

export const defaultVideoBlock: VideoBlockDto = {
  style: "simple",
  headline: "Video Headline",
  subheadline: "Video Subheadline",
  src: "https://www.youtube.com/embed/zpjrVU5nL58",
};
