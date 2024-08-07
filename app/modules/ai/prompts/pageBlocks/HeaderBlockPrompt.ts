export default `
### START: INTERFACES ###
export type HeaderBlockDto = {
  style: HeaderBlockStyle;
  links: NavbarItemDto[];
  withLogo: boolean;
  withSignInAndSignUp: boolean;
  withDarkModeToggle: boolean;
  withLanguageSelector: boolean;
};

export const HeaderBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type HeaderBlockStyle = (typeof HeaderBlockStyles)[number]["value"];

export interface NavbarItemDto {
  id?: string;
  title: string;
  path?: string;
  description?: string;
  className?: string;
  items?: NavbarItemDto[];
  target?: undefined | "_blank";
}

### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "header": {
    "style": "simple",
    "withLogo": "true",
    "withSignInAndSignUp": "true",
    "withDarkModeToggle": "false",
    "withLanguageSelector": "false",
    "links": [
      { "path": "/", "title": "Product" },
      { "path": "/pricing", "title": "Pricing" },
      { "path": "/blog", "title": "Blog" },
      {
        "title": "About",
        "items": [
          { "path": "/contact", "title": "front.navbar.contact" },
          { "path": "/newsletter", "title": "Newsletter" },
        ],
      },
    ]
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
