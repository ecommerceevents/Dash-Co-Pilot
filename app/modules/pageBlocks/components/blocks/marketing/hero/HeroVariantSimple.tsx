import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { HeroBlockDto } from "./HeroBlockUtils";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import ProductHuntBadge from "../launch/ProductHuntBadge";

export default function HeroVariantSimple({ item }: { item: HeroBlockDto }) {
  const { t } = useTranslation();
  return (
    <section>
      <div className="mx-auto flex max-w-screen-xl px-4 py-16 lg:items-center">
        <div className="mx-auto max-w-7xl text-center md:max-w-6xl">
          <div className="mb-4">
            <ProductHuntBadge theme="light" />
            {item.topText && (
              <span className="block text-sm font-semibold uppercase tracking-wide sm:text-base lg:text-sm xl:text-base">
                {t(item.topText.text ?? "")}{" "}
                {item.topText.link && (
                  <ButtonEvent
                    to={item.topText.link.href ?? ""}
                    className="text-primary relative font-semibold"
                    event={{
                      action: "click",
                      category: "hero",
                      label: item.topText.link.text ?? "",
                      value: item.topText.link.href ?? "",
                    }}
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t(item.topText.link.text ?? "")} <span aria-hidden="true">&rarr;</span>
                  </ButtonEvent>
                )}
              </span>
            )}
          </div>
          {item.headline && <h1 className="title-font mb-4 max-w-4xl text-4xl font-bold sm:text-5xl md:text-6xl md:font-black">{t(item.headline)}</h1>}
          {item.description && <h2 className="mb-8 max-w-4xl text-lg leading-relaxed md:text-xl">{t(item.description)}</h2>}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {item.cta.map((item, idx) => {
              return (
                <ButtonEvent
                  key={idx}
                  to={item.href}
                  target={item.target}
                  className={clsx(
                    "w-full sm:w-auto",
                    item.isPrimary
                      ? "bg-primary hover:bg-primary/95 text-primary-foreground inline-flex justify-center rounded-md border-0 px-4 py-3 text-lg shadow-sm focus:outline-none"
                      : "bg-secondary hover:bg-secondary/95 text-secondary-foreground inline-flex justify-center rounded-md border-0 px-4 py-3 text-lg shadow-sm focus:outline-none"
                  )}
                  event={{ action: "click", category: "hero", label: item.text ?? "", value: item.href ?? "" }}
                >
                  {t(item.text)}
                </ButtonEvent>
              );
            })}
          </div>

          <div className="mt-8 space-y-3">
            {item.bottomText && (
              <span>
                {t(item.bottomText.text ?? "")}{" "}
                {item.bottomText.link?.href && (
                  <ButtonEvent
                    to={item.bottomText.link.href ?? ""}
                    target={item.bottomText.link.target}
                    className="text-sm hover:underline"
                    event={{ action: "click", category: "hero", label: item.bottomText.link.text ?? "", value: item.bottomText.link.href ?? "" }}
                  >
                    {t(item.bottomText.link.text ?? "")}
                  </ButtonEvent>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
