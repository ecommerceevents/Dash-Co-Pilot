import { TFunction } from "i18next";
import { FaqItemDto } from "../components/blocks/marketing/faq/FaqBlockUtils";

export function defaultFaq({ t }: { t: TFunction }): FaqItemDto[] {
  const items: FaqItemDto[] = [
    {
      question: t("front.faq.questions.q1"),
      answer: t("front.faq.questions.a1"),
    },
    {
      question: t("front.faq.questions.q2"),
      answer: t("front.faq.questions.a2"),
    },
  ];
  return items;
}
