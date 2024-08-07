export type FaqBlockDto = {
  style: FaqBlockStyle;
  headline?: string;
  subheadline?: string;
  items: {
    question: string;
    answer: string;
    link?: {
      text: string;
      href: string;
    };
  }[];
};
export type FaqItemDto = FaqBlockDto["items"][number];
export const FaqBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type FaqBlockStyle = (typeof FaqBlockStyles)[number]["value"];

export const defaultFaqBlock: FaqBlockDto = {
  style: "simple",
  headline: "Frequently Asked Questions",
  subheadline: "Here are some of our most frequently asked questions.",
  items: [
    {
      question: "Question 1",
      answer: "Answer 1",
    },
    {
      question: "Question 2",
      answer: "Answer 2",
    },
  ],
};
