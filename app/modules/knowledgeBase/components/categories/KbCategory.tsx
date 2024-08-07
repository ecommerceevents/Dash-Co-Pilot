import type { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import type { KbCategoryDto } from "../../dtos/KbCategoryDto";
import BreadcrumbSimple from "~/components/ui/breadcrumbs/BreadcrumbSimple";
import clsx from "clsx";
import { Link, useParams } from "@remix-run/react";
import KbArticlesBySection from "../articles/KbArticlesBySection";
import KnowledgeBaseUtils from "../../utils/KnowledgeBaseUtils";
import ColorTextUtils from "~/utils/shared/colors/ColorTextUtils";
import ColorGroupHoverUtils from "~/utils/shared/colors/ColorGroupHoverUtils";
import { useTranslation } from "react-i18next";

export default function KbCategory({ kb, item, allCategories }: { kb: KnowledgeBaseDto; item: KbCategoryDto; allCategories: KbCategoryDto[] }) {
  const {t} = useTranslation()
  const params = useParams();
  return (
    <div className="space-y-6">
      <BreadcrumbSimple
        menu={[
          {
            title: kb.title,
            routePath: KnowledgeBaseUtils.getKbUrl({ kb, params }),
          },
          {
            title: item.title ?? "",
            routePath: item.href,
          },
        ]}
      />

      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-8">
          <div className="flex w-full flex-col">
            <div className="flex items-center space-x-3">
              {item.icon && (
                <div className="flex-shrink-0">
                  {item.icon.startsWith("<svg") ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          item.icon.replace(
                            "<svg",
                            `<svg class='${clsx("h-7 w-7", ColorTextUtils.getText500(kb.color), ColorGroupHoverUtils.getText700(kb.color))}'`
                          ) ?? "",
                      }}
                    />
                  ) : item.icon.includes("http") ? (
                    <img className="h-7 w-7" src={item.icon} alt={item.title} />
                  ) : (
                    <></>
                  )}
                </div>
              )}
              <div className="text-xl font-bold md:text-2xl">{item.title}</div>
            </div>
            <div className="mt-2 font-normal text-muted-foreground">{item.description}</div>
            {/* <div className="mt-6 flex items-center space-x-2 justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  {item.articles.length} <span>{item.articles.length === 1 ? "article" : "articles"}</span>
                </div>
              </div>
              <div className="text-sm text-gray-400">{item.version}</div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="border-b border-border"></div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 hidden space-y-3 md:block">
          <div className="text font-bold">{t("knowledgeBase.category.plural")}</div>
          <div className="space-y-1">
            {allCategories.map((category) => {
              return (
                <Link to={category.href} key={category.title}>
                  <div
                    className={clsx(
                      "group rounded-md border border-transparent p-2",
                      category.slug === item.slug ? "bg-secondary font-bold" : "hover:bg-secondary"
                    )}
                  >
                    <div className="text-sm">{category.title}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="col-span-12 pt-2 md:col-span-9">
          <KbArticlesBySection kb={kb} item={item} />
        </div>
      </div>
    </div>
  );
}
