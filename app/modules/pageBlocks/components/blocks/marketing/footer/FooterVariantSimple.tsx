import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import { FooterBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlockUtils";
import SocialsVariantSimple from "../../shared/socials/SocialsVariantSimple";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "~/components/ui/toggles/DarkModeToggle";
import ThemeSelector from "~/components/ui/selectors/ThemeSelector";
import LocaleSelector from "~/components/ui/selectors/LocaleSelector";

export default function FooterVariantSimple({ item }: { item: FooterBlockDto }) {
  const { t } = useTranslation();
  return (
    <div>
      <footer>
        <div className="mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
          {item.sections.map((section) => {
            return (
              <nav key={section.name} className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
                {section.items.map((link) => {
                  return (
                    <div key={link.href} className="px-5 py-2">
                      <ButtonEvent
                        to={link.href}
                        target={link.target}
                        className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        event={{ action: "click", category: "footer", label: link.name, value: link.href }}
                      >
                        {t(link.name)}
                      </ButtonEvent>
                    </div>
                  );
                })}
              </nav>
            );
          })}
          <div className="mt-4 flex justify-center space-x-6">
            <SocialsVariantSimple item={item.socials} />
          </div>
          <div className="mt-4 flex items-center justify-center space-x-2">
            {item.withDarkModeToggle && <DarkModeToggle />}
            {item.withLanguageSelector && <LocaleSelector />}
            {item.withThemeSelector && <ThemeSelector />}
          </div>
        </div>
      </footer>
    </div>
  );
}
