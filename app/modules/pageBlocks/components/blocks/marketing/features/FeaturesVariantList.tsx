import { useTranslation } from "react-i18next";
import { FeaturesBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/features/FeaturesBlockUtils";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import { Fragment } from "react";
import GridBlockUtils from "../../shared/grid/GridBlockUtils";
import RightArrowIcon from "~/components/ui/icons/RightArrowIcon";
import clsx from "clsx";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import { ExternalLinkIcon } from "lucide-react";

export default function FeaturesList({ item }: { item: FeaturesBlockDto }) {
  const { t } = useTranslation();
  return (
    <section id="features" className="body-font">
      <div className="container mx-auto space-y-8 px-5 py-24 sm:space-y-12">
        <div
          className={clsx(
            "space-y-5",
            (!item.position || item.position === "center") && "text-center sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl",
            item.position === "left" && "text-left",
            item.position === "right" && "text-right"
          )}
        >
          <div className="space-y-1">
            {item.topText && <div className="text-muted-foreground text-sm font-semibold uppercase leading-8">{t(item.topText)}</div>}
            {item.title && <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.title)}</h1>}
            {item.headline && <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
          </div>
          {item.subheadline && (
            <Fragment>
              {item.title ? (
                <h2 className="text-muted-foreground mx-auto text-xl">{t(item.subheadline)}</h2>
              ) : (
                <p className="text-muted-foreground mx-auto text-xl">{t(item.subheadline)}</p>
              )}
            </Fragment>
          )}

          <div
            className={clsx(
              "mt-8 flex flex-wrap gap-4",
              item.position === "left" && "justify-start",
              (!item.position || item.position === "center") && "justify-center",
              item.position === "right" && "justify-end"
            )}
          >
            {item.cta?.map((item, idx) => {
              return (
                <ButtonEvent
                  key={idx}
                  to={item.href}
                  target={item.target}
                  className={clsx(
                    "flex w-full items-center space-x-2 sm:w-auto",
                    item.isPrimary
                      ? "bg-primary hover:bg-primary/95 text-primary-foreground inline-flex justify-center rounded-md border-0 px-2 py-1 text-base shadow-sm focus:outline-none"
                      : "bg-secondary hover:bg-secondary/95 text-secondary-foreground inline-flex justify-center rounded-md border-0 px-2 py-1 text-base shadow-sm focus:outline-none"
                  )}
                  event={{ action: "click", category: "features", label: item.text ?? "", value: item.href ?? "" }}
                >
                  {t(item.text)} {item.icon === "external" && <ExternalLinkIcon className="text-muted-foreground h-4" />}
                </ButtonEvent>
              );
            })}
          </div>
        </div>

        <div className={clsx(GridBlockUtils.getClasses(item.grid), "mx-auto")}>
          {item.items.map((feature, idx) => {
            return (
              <div key={idx} className="flex">
                <div className="text-primary mb-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  {feature.icon ? (
                    <>
                      {feature.icon.startsWith("<svg") ? (
                        <div dangerouslySetInnerHTML={{ __html: feature.icon.replace("<svg", `<svg class='${" h-5 w-5 "}'`) ?? "" }} />
                      ) : feature.icon.startsWith("http") ? (
                        <img className=" h-5 w-5" src={feature.icon} alt={feature.name} />
                      ) : (
                        feature.icon
                      )}
                    </>
                  ) : (
                    <CheckIcon className="  h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-grow pl-6">
                  <p className="title-font mb-2 text-lg font-medium">{t(feature.name)}</p>
                  <p className="text-base leading-relaxed">{t(feature.description)}</p>
                  {feature.link?.href && (
                    <ButtonEvent
                      to={feature.link?.href}
                      target={feature.link.target}
                      className="text-primary mt-3 inline-flex items-center"
                      event={{ action: "click", category: "features", label: t(feature.name), value: feature.link.href }}
                    >
                      {t(feature.link.text)}
                      <RightArrowIcon className="ml-1 h-4 w-4" />
                    </ButtonEvent>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
