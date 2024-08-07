import { HeaderBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlockUtils";
import { defaultHeader } from "~/modules/pageBlocks/utils/defaultHeader";
import HeaderVariantSimple from "./HeaderVariantSimple";
import { useTranslation } from "react-i18next";

export default function HeaderBlock({ item, width }: { item?: HeaderBlockDto; width?: "screen-2xl" | "7xl" }) {
  const { t } = useTranslation();
  const header = item ?? defaultHeader({ t });
  return <>{header && <>{header.style === "simple" && <HeaderVariantSimple item={header} width={width} />}</>}</>;
}
