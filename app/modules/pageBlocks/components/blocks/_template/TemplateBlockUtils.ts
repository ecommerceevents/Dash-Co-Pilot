export type TemplateBlockDto = {
  style: TemplateBlockStyle;
  text?: string;
  items: TemplateItemDto[];
};

interface TemplateItemDto {
  name: string;
  value: string;
}

export const TemplateBlockStyles = [
  { value: "variant1", name: "Variant 1" },
  { value: "variant2", name: "Variant 2" },
] as const;
export type TemplateBlockStyle = (typeof TemplateBlockStyles)[number]["value"];

export const defaultTemplateBlock: TemplateBlockDto = {
  style: "variant1",
  text: "Template Block Text",
  items: [
    {
      name: "Item 1",
      value: "Item 1 Value",
    },
    {
      name: "Item 2",
      value: "Item 2 Value",
    },
  ],
};
