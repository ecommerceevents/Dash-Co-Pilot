import clsx from "clsx";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import GitHubIcon from "~/components/ui/icons/GitHubIcon";
import { BannerBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/banner/BannerBlockUtils";

export default function BannerVariantTop({ item, onClose }: { item: BannerBlockDto; onClose?: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return (
    <span>
      {item && open && (
        <div className="border-border bg-primary text-primary-foreground border-b-2">
          <div className="mx-auto max-w-7xl px-3 py-1.5 sm:px-6 sm:py-3 lg:px-8">
            <div className="flex w-full items-center space-x-3 lg:w-auto lg:justify-end">
              <div className={clsx("flex flex-grow", item.cta ? "justify-start" : "justify-center")}>
                <div className="flex items-center space-x-2">
                  {item.icon === "sale" && (
                    <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                      <path
                        fill="#f44336"
                        d="M24,2l4.506,5.029L35,5l1.465,6.535L43,13l-2,6.494L46,24l-5,4.506L43,35l-6.535,1.465L35,43l-6.494-2.029L24,46l-4.506-5.029L13,43l-1.465-6.535L5,35l2-6.494L2,24l5-4.506L5,13l6.535-1.465L13,5l6.494,2.029L24,2z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M22.199 26.398H20L19.602 28h-1.703l2.5-8h1.5l2.5 8h-1.699L22.199 26.398zM20.301 25h1.5l-.699-2.801L20.301 25zM27.199 26.602H30V28h-4.398v-8h1.598V26.602zM35.602 24.5h-2.5v2.102h3V28H31.5v-8h4.602v1.301h-3v1.898h2.5V24.5zM15.102 25.898c0-1.699-3.402-1.098-3.402-3.797 0-.801.5-2.203 2.5-2.203 2.199 0 2.5 1.902 2.5 2.5h-1.598c0-.598-.301-1.098-.902-1.098-.898 0-.898.801-.898.898 0 1.5 3.398.902 3.398 3.699 0 1.203-.801 2.203-2.5 2.203-1.398 0-2.801-.902-2.801-2.602H13c0 .5.102 1.301 1.102 1.301C14.602 26.801 15.102 26.699 15.102 25.898z"
                      ></path>
                    </svg>
                  )}
                  {item.href ? (
                    <ButtonEvent
                      event={{ action: "click", category: "banner", label: typeof item.text === "string" ? item.text : "button", value: item.href }}
                      to={item.href}
                      target={item.target}
                      className="flex items-baseline space-x-1 text-sm font-medium hover:underline sm:text-base"
                    >
                      {!item.textMd && item.text ? (
                        <span>{t(item.text)}</span>
                      ) : (
                        <Fragment>
                          {item.textMd && <span className="hidden md:block">{t(item.textMd)}</span>}
                          {item.text && <span className="md:hidden">{t(item.text)}</span>}
                        </Fragment>
                      )}
                    </ButtonEvent>
                  ) : (
                    <div className="flex items-baseline space-x-1 text-sm font-medium sm:text-base">
                      {!item.textMd && item.text ? (
                        <span>{t(item.text)}</span>
                      ) : (
                        <Fragment>
                          {item.textMd && <span className="hidden md:block">{t(item.textMd)}</span>}
                          {item.text && <span className="md:hidden">{t(item.text)}</span>}
                        </Fragment>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {item.cta && (
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
                        {cta.icon === "Discord" && (
                          <div>
                            <span className="sr-only">Discord</span>
                            <svg className="h-5 w-5" viewBox="0 -28.5 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                              <path
                                d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                        )}
                      </ButtonEvent>
                    );
                  })}
                </div>
              )}
              <div className="order-3 ml-2 hidden flex-shrink-0 sm:flex">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (onClose) {
                      onClose();
                    }
                  }}
                  className="text-primary-foreground hover:border-border -mr-1 flex rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 sm:-mr-2"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
