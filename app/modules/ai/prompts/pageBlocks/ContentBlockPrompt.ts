export default `
### START: INTERFACES ###

export type ContentBlockDto = {
  style: ContentBlockStyle;
  content: string;
};

export const ContentBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type ContentBlockStyle = (typeof ContentBlockStyles)[number]["value"];

export const defaultContentBlock: ContentBlockDto = {
  style: "simple",
  content: "HTML content here",
};

### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "content": {
    "style": "simple",
    content: "HTML content here",
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
