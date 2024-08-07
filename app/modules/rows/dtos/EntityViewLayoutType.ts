export const EntityViewLayoutTypes = [
  { name: "Table", value: "table" },
  { name: "Grid", value: "grid" },
  { name: "Card", value: "card" },
  { name: "Board", value: "board" },
] as const;
export type EntityViewLayoutType = (typeof EntityViewLayoutTypes)[number]["value"];
