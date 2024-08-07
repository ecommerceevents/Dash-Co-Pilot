import { TFunction } from "i18next";
import { BannerBlockDto } from "../components/blocks/marketing/banner/BannerBlockUtils";

export function defaultBanner({ t }: { t: TFunction }): BannerBlockDto | undefined {
  return undefined;
}
