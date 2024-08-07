import clsx from "clsx";

export const gridCols = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
export const gaps = ["none", "xs", "sm", "md", "lg"] as const;
export interface GridBlockDto {
  columns?: (typeof gridCols)[number];
  gap?: (typeof gaps)[number];
}

function getClasses(grid?: GridBlockDto) {
  return clsx(
    "grid",
    grid?.gap === "none" && "gap-0",
    (!grid?.gap || grid?.gap === "sm") && "gap-4",
    grid?.gap === "xs" && "gap-2",
    grid?.gap === "md" && "gap-8",
    grid?.gap === "lg" && "gap-12",
    grid?.columns === "2" && "grid-cols-1 sm:grid-cols-2",
    grid?.columns === "3" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    (!grid?.columns || grid?.columns === "4") && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    grid?.columns === "5" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    grid?.columns === "6" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    grid?.columns === "7" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-7",
    grid?.columns === "8" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-8",
    grid?.columns === "9" && "grid-cols-4 sm:grid-cols-4 lg:grid-cols-9",
    grid?.columns === "10" && "grid-cols-4 sm:grid-cols-5 lg:grid-cols-10",
    grid?.columns === "11" && "grid-cols-4 sm:grid-cols-5 lg:grid-cols-11",
    grid?.columns === "12" && "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12"
  );
}

export default {
  getClasses,
};
