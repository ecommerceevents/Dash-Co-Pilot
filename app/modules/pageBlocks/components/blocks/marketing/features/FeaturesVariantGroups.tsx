import { useTranslation } from "react-i18next";
import { FeatureDto, FeaturesBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/features/FeaturesBlockUtils";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import { Fragment, useEffect, useState } from "react";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import clsx from "clsx";
import { ExternalLinkIcon } from "lucide-react";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBackgroundUtils from "~/utils/shared/colors/ColorBackgroundUtils";
import ColorBorderUtils from "~/utils/shared/colors/ColorBorderUtils";
import ColorTextUtils from "~/utils/shared/colors/ColorTextUtils";
import ColorDarkUtils from "~/utils/shared/colors/ColorDarkUtils";

export default function FeaturesVariantGroups({ item }: { item: FeaturesBlockDto }) {
  const { t } = useTranslation();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [currentFeature, setCurrentFeature] = useState<FeatureDto | null>(item.items.length > 0 ? item.items[0] : null);
  useEffect(() => {
    if (selectedIdx < item.items.length) {
      setCurrentFeature(item.items[selectedIdx]);
    } else {
      setCurrentFeature(null);
    }
  }, [selectedIdx, item.items]);
  return (
    <div className="w-full">
      <section id="features" className="body-font">
        <div className="container mx-auto max-w-6xl space-y-8 px-5 py-12">
          <div
            className={clsx(
              "space-y-5",
              (!item.position || item.position === "center") && "text-center sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl",
              item.position === "left" && "text-left",
              item.position === "right" && "text-right"
            )}
          >
            <div className="space-y-1">
              {item.topText && <div className="text-sm font-semibold uppercase leading-8">{t(item.topText)}</div>}
              {item.title && <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.title)}</h1>}
              {item.headline && <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
            </div>
            {item.subheadline && (
              <Fragment>
                {item.title ? <h2 className="mx-auto text-xl">{t(item.subheadline)}</h2> : <p className="mx-auto text-xl">{t(item.subheadline)}</p>}
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
                    {t(item.text)} {item.icon === "external" && <ExternalLinkIcon className="h-4" />}
                  </ButtonEvent>
                );
              })}
            </div>
          </div>

          {item.items.length === 0 ? (
            <div className="border border-red-500 bg-red-50 p-12">No features</div>
          ) : !currentFeature ? (
            <div className="border border-red-500 bg-red-50 p-12">No feature selected</div>
          ) : (
            <div
              className={clsx(
                "rounded-lg border p-6 shadow-sm",
                ColorBackgroundUtils.getBg50(item.color ?? Colors.GRAY),
                ColorBorderUtils.get300(item.color ?? Colors.GRAY),
                "dark:bg-gray-900"
              )}
            >
              <div className="relative flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <div className="md:w-3/12">
                  <div className="flex flex-col space-y-3">
                    <FeaturesNav item={item} features={item.items} selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} />
                    <div className="space-y-1">
                      {currentFeature.subFeatures?.map((subFeature, idx) => {
                        return (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="mr-3 inline-flex flex-shrink-0 items-center justify-center text-purple-500">
                              <CheckIcon className="text-primary h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="line-clamp-1">
                              <span className="">{subFeature.name}</span>
                              {subFeature.description && <span className="text-xs">: {subFeature.description}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col space-y-4">
                      {currentFeature.highlight && (
                        <div>
                          <div className="bg-primary text-primary-foreground ring-ring inline-flex cursor-default items-center rounded-md px-2 py-1 text-sm font-bold ring">
                            {currentFeature.highlight.text}
                          </div>
                        </div>
                      )}
                      {currentFeature.link && (
                        <ButtonEvent
                          to={currentFeature.link.href}
                          target={currentFeature.link.target}
                          className="underline"
                          event={{ action: "click", category: "feature-groups", label: t(currentFeature.name), value: currentFeature.link.href }}
                        >
                          {t(currentFeature.link.text)} &rarr;
                        </ButtonEvent>
                      )}
                    </div>
                    {currentFeature.logos && (
                      <div>
                        <div className="space-y-2">
                          {currentFeature.logos.title && <div className="text-sm font-medium">{currentFeature.logos.title}</div>}
                          {currentFeature.logos.items && (
                            <div className="flex flex-wrap gap-4">
                              {currentFeature.logos.items.map((item, idx) => {
                                return (
                                  <div key={idx} className="flex items-center space-x-1">
                                    {!item.img && item.name ? (
                                      <div className="rounded-md text-base font-bold">{item.name}</div>
                                    ) : (
                                      <div className="mr-3 inline-flex flex-shrink-0 items-center justify-start space-x-2">
                                        {item.img && (
                                          <div>
                                            {item.img && (item.img.startsWith("<svg") || item.img.startsWith("<div")) ? (
                                              <div dangerouslySetInnerHTML={{ __html: item.img.replace("<svg", `<svg class='${" h-5 "}'`) ?? "" }} />
                                            ) : item.img?.startsWith("http") || item.img?.startsWith("data:image") ? (
                                              <img className="h-6" src={item.img} alt={item.name} />
                                            ) : (
                                              item.img
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-full space-y-2 md:w-9/12">
                  <div className="mt-1 line-clamp-2 text-base font-medium">{currentFeature.description}</div>
                  <div className="group h-full">
                    {currentFeature.link ? (
                      <ButtonEvent
                        to={currentFeature.link.href}
                        target={currentFeature.link.target}
                        className={clsx(
                          "flex h-full flex-col rounded-lg md:p-1",
                          item.color ? clsx(ColorBorderUtils.get100(item.color), ColorBackgroundUtils.getBg50(item.color)) : ""
                        )}
                        event={{ action: "click", category: "feature-groups", label: t(currentFeature.name), value: currentFeature.link.href }}
                      >
                        <img
                          key={selectedIdx}
                          src={currentFeature.img}
                          alt={currentFeature.name}
                          className=" h-52 overflow-hidden rounded-md border-gray-900 object-cover shadow-sm transition-all duration-500  hover:border-gray-800 sm:h-72 md:h-full"
                        />
                      </ButtonEvent>
                    ) : (
                      <img
                        key={selectedIdx}
                        src={currentFeature.img}
                        alt={currentFeature.name}
                        className=" h-52 overflow-hidden rounded-md border-gray-900 object-cover shadow-sm transition-all duration-500  sm:h-72 md:h-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FeaturesNav({
  item,
  features,
  selectedIdx,
  setSelectedIdx,
}: {
  item: FeaturesBlockDto;
  features: FeatureDto[];
  selectedIdx: number;
  setSelectedIdx: (idx: number) => void;
}) {
  const [secondsDisabled, setSecondsDisabled] = useState(0);
  useEffect(() => {
    if (secondsDisabled > 0) {
      const interval = setInterval(() => {
        setSecondsDisabled(secondsDisabled - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [secondsDisabled]);
  return (
    <div>
      <div className="flex flex-wrap sm:flex-col">
        {features.map((feature, idx) => {
          return (
            <div
              key={idx}
              className={clsx("m-1 flex cursor-pointer items-center space-x-2 text-lg", selectedIdx === idx ? "font-bold" : "font-bold opacity-60")}
              onClick={() => {
                if (!feature.disabled) {
                  setSecondsDisabled(2);
                  setSelectedIdx(idx);
                }
              }}
              onMouseEnter={() => {
                if (!feature.disabled && secondsDisabled === 0) {
                  setSelectedIdx(idx);
                }
              }}
            >
              <div
                className={clsx(
                  "h-7 w-7 rounded-full p-1 text-center text-sm",
                  selectedIdx === idx
                    ? // "bg-theme-500 text-theme-100"
                      clsx(
                        item.color
                          ? clsx(ColorBackgroundUtils.getBg400(item?.color), ColorTextUtils.getText100(item?.color), ColorDarkUtils.getBg600(item?.color))
                          : "text-primary-foreground bg-primary"
                      )
                    : "border-transparent bg-transparent"
                )}
              >
                {idx + 1}
              </div>
              <div>{feature.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
