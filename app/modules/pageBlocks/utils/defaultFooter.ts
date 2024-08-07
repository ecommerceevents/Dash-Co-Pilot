import { TFunction } from "i18next";
import { FooterBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlockUtils";
import { defaultSocials } from "./defaultSocials";

export function defaultFooter({ t }: { t: TFunction }): FooterBlockDto {
  return {
    style: "columns",
    text: t("front.footer.headline"),
    withDarkModeToggle: true,
    withLanguageSelector: true,
    withThemeSelector: true,
    sections: [
      {
        name: t("front.footer.application"),
        items: [
          { name: t("front.footer.pricing"), href: "/pricing" },
          { name: t("front.footer.signIn"), href: "/login" },
          { name: t("front.footer.signUp"), href: "/register" },
          { name: t("front.footer.blog"), href: "/blog" },
          // { name: t("front.footer.docs"), href: "/docs" },
        ],
      },
      {
        name: t("front.footer.product"),
        items: [
          { name: t("front.footer.contact"), href: "/contact" },
          { name: t("front.footer.newsletter"), href: "/newsletter" },
          { name: t("front.footer.changelog"), href: "/changelog" },
          { name: t("front.footer.termsAndConditions"), href: "/terms-and-conditions" },
          { name: t("front.footer.privacyPolicy"), href: "/privacy-policy" },
        ],
      },
    ],
    socials: defaultSocials,
  };
}
