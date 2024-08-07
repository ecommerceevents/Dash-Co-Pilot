import { Link } from "@remix-run/react";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { allApplicationCookies, allCookieCategories } from "~/application/cookies/ApplicationCookies";
import { CookieCategory } from "~/application/cookies/CookieCategory";
import InputCheckbox from "../ui/input/InputCheckbox";

export default function CookiesList({
  selectedCookies,
  toggle,
  editing,
}: {
  selectedCookies?: CookieCategory[];
  toggle?: (category: CookieCategory) => void;
  editing?: boolean;
}) {
  const { t } = useTranslation();
  const [openCategories, setOpenCategories] = useState<CookieCategory[]>([]);
  function isCategoryOpen(category: CookieCategory) {
    return openCategories.includes(category);
  }
  function toggleOpenCategory(category: CookieCategory) {
    const newOpenCategories = isCategoryOpen(category) ? openCategories.filter((c) => c !== category) : [...openCategories, category];
    setOpenCategories(newOpenCategories);
  }
  return (
    <div className={clsx("overflow-hidden overflow-y-auto rounded-md border border-gray-300 bg-gray-50 text-gray-900", !editing && "max-h-72")}>
      {allCookieCategories.map((category, idx) => {
        return (
          <Fragment key={category}>
            <div
              className={clsx(
                "flex items-center justify-between border-gray-300 bg-white px-4 py-2 hover:bg-gray-50",
                idx < allCookieCategories.length - 1 && "border-b"
              )}
            >
              <button type="button" onClick={() => toggleOpenCategory(category)} className="flex w-full items-center space-x-2 px-2 py-3 font-medium">
                <div>{isCategoryOpen(category) ? "-" : "+"}</div>
                <div>{t("cookies.categories." + CookieCategory[category] + ".name")}</div>
                <div className="text-xs font-normal text-gray-500">({allApplicationCookies.filter((f) => f.category === category).length} cookies) </div>
              </button>
              {toggle !== undefined && selectedCookies !== undefined && (
                <InputCheckbox
                  value={selectedCookies.includes(category) || category === CookieCategory.REQUIRED}
                  setValue={() => toggle(category)}
                  disabled={category === CookieCategory.REQUIRED}
                />
              )}
            </div>
            {isCategoryOpen(category) && (
              <div className="space-y-2 px-4 py-4 pb-2">
                <div className="text-sm text-gray-600">{t("cookies.categories." + CookieCategory[category] + ".description")}</div>

                {allApplicationCookies
                  .filter((f) => f.category === category)
                  .map((item) => {
                    return (
                      <div key={item.name} className="space-y-2 rounded-md border border-dashed border-gray-300 bg-gray-100 p-2 py-2">
                        <div className="flex items-baseline justify-between font-bold">
                          <div>{item.name}</div>
                          {item.href?.startsWith("http") ? (
                            <a target="_blank" rel="noreferrer" href={item.href} className="text-theme-500 text-xs underline">
                              {t("shared.learnMore")}
                            </a>
                          ) : item.href ? (
                            <Link to={item.href} className="text-theme-500 text-xs underline">
                              {t("shared.learnMore")}
                            </Link>
                          ) : null}
                        </div>
                        <div className="text-sm font-light text-gray-600">{item.description}</div>
                        <div className="w-full border-t border-gray-300" />
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">{t("shared.expiry")}:</span> {item.expiry ?? "?"}
                          </div>
                          {item.type && (
                            <div>
                              <span className="font-medium">{t("shared.type")}:</span> {item.type ?? "?"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
