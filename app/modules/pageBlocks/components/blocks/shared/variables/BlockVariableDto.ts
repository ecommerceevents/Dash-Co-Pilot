export interface BlockVariableDto {
  type: "manual" | "param" | "query";
  param?: "id1" | "id2";
  query?: string;
  value?: string | null;
  required?: boolean;
}
