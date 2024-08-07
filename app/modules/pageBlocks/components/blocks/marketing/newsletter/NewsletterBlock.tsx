import { NewsletterBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/newsletter/NewsletterBlockUtils";
import NewsletterVariantSimple from "./NewsletterVariantSimple";
import NewsletterVariantRightForm from "./NewsletterVariantRightForm";

export default function NewsletterBlock({ item }: { item: NewsletterBlockDto }) {
  return (
    <>
      {item.style === "simple" && <NewsletterVariantSimple item={item} />}
      {item.style === "rightForm" && <NewsletterVariantRightForm item={item} />}
    </>
  );
}
