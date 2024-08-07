import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BannerBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/banner/BannerBlockUtils";
import MegaphoneIcon from "~/components/ui/icons/emails/MegaphoneIcon";
import XIcon from "~/components/ui/icons/XIcon";
import clsx from "clsx";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import GitHubIcon from "~/components/ui/icons/GitHubIcon";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";

export default function BannerVariantBottom({ item, onClose }: { item: BannerBlockDto; onClose?: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  return (
    <>
      {item && open && (
        <div className="fixed inset-x-0 bottom-0 z-30 pb-2 sm:pb-5">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="border-primary bg-primary text-primary-foreground rounded-lg border p-2 shadow-lg sm:p-3">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex w-0 flex-1 items-center">
                  <span className=" flex rounded-lg p-2">
                    <MegaphoneIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="ml-3 truncate font-medium">
                    {item.textMd && <span className="hidden md:block">{t(item.textMd)}</span>}
                    {item.text && <span className="md:hidden">{t(item.text)}</span>}
                  </p>
                </div>
                <div className="order-2 mt-0 flex w-auto flex-shrink-0 space-x-1 md:space-x-2">
                  {item.cta.map((cta) => {
                    return (
                      <ButtonEvent
                        key={cta.href}
                        to={cta.href}
                        target={cta.target}
                        className={clsx(
                          "flex items-center justify-center space-x-1 rounded-md border px-3 py-2 text-xs font-medium sm:text-sm md:px-4",
                          !cta.isPrimary
                            ? "bg-primary text-primary-foreground shadow"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm"
                        )}
                        event={{ action: "click", category: "banner", label: typeof cta.text === "string" ? cta.text : "icon", value: cta.href }}
                      >
                        <div>{cta.text}</div>
                        {cta.icon === "GitHub" && <GitHubIcon className="hidden h-5 w-5 md:block" />}
                        {cta.icon === "External" && <ExternalLinkEmptyIcon className="hidden h-4 w-4 md:block" />}
                      </ButtonEvent>
                    );
                  })}
                </div>
                <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      if (onClose) {
                        onClose();
                      }
                    }}
                    type="button"
                    className="-mr-1 flex rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="sr-only">{t("shared.close")}</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
