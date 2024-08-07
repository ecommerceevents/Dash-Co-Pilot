import { useTranslation } from "react-i18next";
import { FooterBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlockUtils";
import { defaultFooter } from "~/modules/pageBlocks/utils/defaultFooter";
import FooterVariantColumns from "./FooterVariantColumns";
import FooterVariantSimple from "./FooterVariantSimple";

export default function FooterBlock({ item }: { item?: FooterBlockDto }) {
  const { t } = useTranslation();
  const footer = item ?? defaultFooter({ t });
  return (
    <>
      {footer && (
        <>
          {footer.style === "simple" && <FooterVariantSimple item={footer} />}
          {footer.style === "columns" && <FooterVariantColumns item={footer} />}
        </>
      )}
    </>
  );
}
