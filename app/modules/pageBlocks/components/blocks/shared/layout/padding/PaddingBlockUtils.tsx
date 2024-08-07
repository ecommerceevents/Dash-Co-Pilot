import clsx from "clsx";

export const paddingX = ["px-0", "px-2", "px-4", "px-8", "px-12"] as const;
export const paddingY = ["py-0", "py-2", "py-4", "py-8", "py-12"] as const;
export interface PaddingBlockDto {
  x?: (typeof paddingX)[number];
  y?: (typeof paddingY)[number];
}

function getClasses(item?: PaddingBlockDto) {
  return clsx(item?.x, item?.y);
}

export default {
  getClasses,
};
