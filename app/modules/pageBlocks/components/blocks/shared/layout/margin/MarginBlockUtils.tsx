import clsx from "clsx";

export const marginX = ["mx-auto", "mx-0", "mx-2", "mx-4", "mx-8", "mx-12"] as const;
export const marginY = ["my-auto", "my-0", "my-2", "my-4", "my-8", "my-12"] as const;
export interface MarginBlockDto {
  x?: (typeof marginX)[number];
  y?: (typeof marginY)[number];
}

function getClasses(item?: MarginBlockDto) {
  return clsx(item?.x, item?.y);
}

export default {
  getClasses,
};
