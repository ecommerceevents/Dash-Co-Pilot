export default `
### START: INTERFACES ###
export type TestimonialsBlockDto = {
  style: TestimonialsBlockStyle;
  headline: string;
  subheadline: string;
  items: {
    company: string;
    companyUrl: string;
    logoLightMode?: string;
    logoDarkMode?: string;
    quote: string;
    name: string;
    personalWebsite?: string;
    avatar: string;
    role: string;
  }[];
};

export const TestimonialsBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type TestimonialsBlockStyle = (typeof TestimonialsBlockStyles)[number]["value"];
### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "testimonials": {
    "style": "simple",
  "headline": "Testimonials Headline",
  "subheadline": "Testimonials Subheadline",
  "items": [
    {
      "name": "John Doe",
      "avatar": "https://via.placeholder.com/100x100?text=Avatar",
      "role": "CEO",
      "company": "Company",
      "companyUrl": "https://example.com",
      "logoLightMode": "https://via.placeholder.com/300x120?text=Company%20Logo",
      "logoDarkMode": "https://via.placeholder.com/300x120?text=Company%20Logo",
      "personalWebsite": "https://example.com",
      "quote": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ],
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
