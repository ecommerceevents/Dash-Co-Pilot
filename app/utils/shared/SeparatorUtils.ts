export type SeparatorFormatType = "Enter" | "Tab" | "," | ";" | " " | ".";
export const SeparatorFormats: { name: string; value: SeparatorFormatType }[] = [
  { name: "Enter", value: "Enter" },
  { name: "Tab", value: "Tab" },
  { name: "Comma", value: "," },
  { name: "Semicolon", value: ";" },
  { name: "Space", value: " " },
  { name: "Dot", value: "." },
];
export function getSeparator(separator: string | undefined): SeparatorFormatType {
  switch (separator) {
    case "Enter":
      return "Enter";
    case "Tab":
      return "Tab";
    case ",":
      return ",";
    case ";":
      return ";";
    case " ":
      return " ";
    case ".":
      return ".";
    default:
      return "Enter";
  }
}
