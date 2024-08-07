import { TFunction } from "i18next";
import { HeaderBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlockUtils";

export function defaultHeader({ t }: { t: TFunction }): HeaderBlockDto {
  return {
    style: "simple",
    withLogo: true,
    withSignInAndSignUp: true,
    withDarkModeToggle: true,
    withLanguageSelector: true,
    withThemeSelector: true,
    links: [
      { path: "/pricing", title: t("front.navbar.pricing") },
      { path: "/blog", title: t("front.navbar.blog") },
      {
        title: t("shared.more"),
        items: [
          { path: "/contact", title: "front.navbar.contact" },
          { path: "/newsletter", title: "Newsletter" },
        ],
      },
    ],
  };
}
