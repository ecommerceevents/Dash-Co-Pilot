export type HeadingBlockDto = {
  style: HeadingBlockStyle;
  headline: string;
  subheadline: string;
};

export const HeadingBlockStyles = [
  { value: "left", name: "Left" },
  { value: "centered", name: "Centered" },
  { value: "right", name: "Right" },
] as const;
export type HeadingBlockStyle = (typeof HeadingBlockStyles)[number]["value"];

export const defaultHeadingBlock: HeadingBlockDto = {
  style: "centered",
  headline: "Heading",
  subheadline: "Subheadline",
};
