import { BannerBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/banner/BannerBlockUtils";
import BannerVariantTop from "./BannerVariantTop";
import BannerVariantBottom from "./BannerVariantBottom";
import { defaultBanner } from "~/modules/pageBlocks/utils/defaultBanner";
import { useTranslation } from "react-i18next";

export default function BannerBlock({ item }: { item?: BannerBlockDto }) {
  const { t } = useTranslation();
  const banner = item ?? defaultBanner({ t });
  return (
    <>
      {banner?.style === "top" && <BannerVariantTop item={banner} />}
      {banner?.style === "bottom" && <BannerVariantBottom item={banner} />}
    </>
  );
}
