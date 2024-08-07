export default `
### START: INTERFACES ###
export type FaqBlockDto = {
  style: FaqBlockStyle;
  headline?: string;
  items: {
    question: string;
    answer: string;
    link?: {
      text: string;
      href: string;
    };
  }[];
};

export const FaqBlockStyles = [{ value: "simple", name: "Simple" }] as const;
export type FaqBlockStyle = (typeof FaqBlockStyles)[number]["value"];
### END: INTERFACES ###

### START: SAMPLE OUTPUT FORMAT ###
${"```json"}
{
  "faq": {
      "style": "simple",
  "headline": "Frequently Asked Questions",
  "items": [
    {
      "question": "How do I get the code after purchasing?",
      "answer":
        "You will be invited to the saasrock-core repository on GitHub. If you bought SaasRock Enterprise you will also be invited to the saasrock-enterprise repository.",
    },
    {
      "question": "Will there be updates every month?",
      "answer": "No, I can't guarantee that, but I'll try. What you can do is pausing your subscription and come back when you see a shiny new feature.",
    },
    {
      "question": "Can I get a refund?",
      "answer": "Due to the nature of software development being a custom service, we do not offer refunds.",
    },
    {
      "question": "Is it really a perpetual license for unlimited websites?",
      "answer":
        "Yes, you don't need a subscription to use SaasRock for your SaaS app development. Subscription is only required to get access to the private repository to get updates.",
    },
    {
      "question": "Will I still get updates after my subscription expires?",
      "answer": "No, you could subscribe again to get the latest updates.",
    },
  ],
  }
}
${"```"}
### END: SAMPLE OUTPUT FORMAT ###
`;
