import { TFunction } from "i18next";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import { defaultHeader } from "../defaultHeader";
import { defaultFooter } from "../defaultFooter";
import { defaultPricingBlock } from "../../components/blocks/marketing/pricing/PricingBlockUtils";

export function defaultPricingPage({ t }: { t: TFunction }) {
  const blocks: PageBlockDto[] = [
    // Header
    { header: defaultHeader({ t }) },
    // Heading
    {
      heading: {
        style: "centered",
        headline: t("front.pricing.title"),
        subheadline: t("front.pricing.headline"),
      },
      layout: {
        padding: { y: "py-4" },
      },
    },
    // Pricing
    {
      pricing: defaultPricingBlock,
    },
    // Footer
    {
      footer: defaultFooter({ t }),
    },
  ];
  return blocks;
}
