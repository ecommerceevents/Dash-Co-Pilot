import { useTranslation } from "react-i18next";
import { PricingContactUsDto } from "../PricingBlockUtils";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";

export default function PricingContactUs({ item }: { item: PricingContactUsDto }) {
  const { t } = useTranslation();
  return (
    <div className="relative lg:mx-4">
      <div>
        <div className="border-border mx-auto overflow-hidden rounded-lg border shadow-xl lg:flex">
          <div className="bg-primary text-primary-foreground flex-1 px-6 py-8 lg:p-12">
            <h3 className="text-2xl font-extrabold sm:text-3xl">{t(item.title)}</h3>
            <p className="mt-6 text-base">{t(item.description)}</p>
            <div className="mt-8">
              <div className="flex items-center">
                <h4 className="flex-shrink-0 pr-4 text-sm font-semibold uppercase tracking-wider">{t("pricing.whatsIncluded")}</h4>
                <div className="border-primary-foreground flex-1 border-t"></div>
              </div>
              <ul className="mt-8 space-y-5 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5 lg:space-y-0">
                {item.features.map((feature, idxFeature) => {
                  return (
                    <li key={idxFeature} className="flex items-start lg:col-span-1">
                      <div className="flex-shrink-0">
                        {/* Heroicon name: solid/check-circle */}
                        <svg
                          className="  text-primary-foreground h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm">
                        <span>{t(feature)}</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="px-6 py-8 text-center lg:flex lg:flex-shrink-0 lg:flex-col lg:justify-center lg:p-12">
            <div className="mt-4 flex items-center justify-center text-5xl font-extrabold">
              <span>{t("pricing.contactUs")}</span>
            </div>
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground font-medium">{t("pricing.customPlanDescription")}</span>
            </p>
            <div className="mt-6">
              <div className="mx-auto max-w-md rounded-md shadow">
                <ButtonEvent
                  event={{ action: "click", category: "pricing", label: "contact", value: "contact" }}
                  to="/contact"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground inline-flex w-full justify-center rounded-md border-0 px-4 py-3 text-lg shadow-sm focus:outline-none"
                >
                  {t("pricing.contact")}
                </ButtonEvent>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
