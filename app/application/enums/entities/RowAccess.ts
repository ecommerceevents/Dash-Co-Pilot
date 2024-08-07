export const RowAccessTypes = ["none", "view", "comment", "edit", "delete"] as const;
export type RowAccess = (typeof RowAccessTypes)[number];
