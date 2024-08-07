import { useTranslation } from "react-i18next";
import { GalleryBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/gallery/GalleryBlockUtils";
import CustomCarousel from "~/components/ui/images/CustomCarousel";

export default function GalleryVariantCarousel({ item }: { item: GalleryBlockDto }) {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden py-8">
      <div className="mx-auto max-w-4xl space-y-8 px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-5xl lg:px-8">
        <div>
          {item.topText && <h2 className="text-theme-600 text-base font-semibold uppercase tracking-wider">{item.topText}</h2>}
          {item.headline && <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</p>}
          {item.subheadline && <p className="text-muted-foreground mx-auto mt-5 max-w-prose text-base">{t(item.subheadline)}</p>}
        </div>
        <div className="mx-auto">
          <CustomCarousel items={item.items} />
        </div>
      </div>
    </div>
  );
}
