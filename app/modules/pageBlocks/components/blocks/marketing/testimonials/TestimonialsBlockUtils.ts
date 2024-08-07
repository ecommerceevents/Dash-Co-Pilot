export type TestimonialsBlockDto = {
  style: TestimonialsBlockStyle;
  headline: string;
  subheadline: string;
  items: TestimonialDto[];
  reviews?: {
    trustpilot?: {
      href: string;
      templateId: string;
      businessUnitId: string;
    };
  };
};
export type TestimonialDto = {
  company?: string;
  companyUrl?: string;
  logoLightMode?: string;
  logoDarkMode?: string;
  title?: string;
  quote: string;
  name: string;
  personalWebsite?: string;
  avatar: string;
  role?: string;
  createdAt?: Date;
  quoteUrl?: string;
  stars?: number;
};
export const TestimonialsBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type TestimonialsBlockStyle = (typeof TestimonialsBlockStyles)[number]["value"];

export const defaultTestimonialsBlock: TestimonialsBlockDto = {
  style: "simple",
  headline: "Testimonials Headline",
  subheadline: "Testimonials Subheadline",
  items: [
    {
      name: "John Doe",
      avatar: "https://via.placeholder.com/100x100?text=Avatar",
      role: "CEO",
      company: "Company",
      companyUrl: "https://example.com",
      logoLightMode: "https://via.placeholder.com/300x120?text=Company%20Logo",
      logoDarkMode: "https://via.placeholder.com/300x120?text=Company%20Logo",
      personalWebsite: "https://example.com",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ],
};
