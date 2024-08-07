import { Link } from "@remix-run/react";
import clsx from "clsx";
import type { KbCategoryDto } from "~/modules/knowledgeBase/dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import ColorTextUtils from "~/utils/shared/colors/ColorTextUtils";
import ColorGroupHoverUtils from "~/utils/shared/colors/ColorGroupHoverUtils";

export default function KbCategoriesGrid({ kb, items, columns }: { kb: KnowledgeBaseDto; items: KbCategoryDto[]; columns: number }) {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 gap-4",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-3",
        columns === 4 && "md:grid-cols-4",
        columns === 5 && "md:grid-cols-5",
        columns === 6 && "md:grid-cols-6"
      )}
    >
      {items.map((item) => {
        return (
          <div key={item.title} className="group rounded-md border border-border bg-background hover:bg-secondary hover:border-secondary-foreground">
            <Link to={item.href} className="w-full">
              <div className="flex flex-col space-y-3 p-6">
                <div className="flex-shrink-0">
                  {item.icon.startsWith("<svg") ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          item.icon.replace(
                            "<svg",
                            `<svg class='${clsx("h-8 w-8", ColorTextUtils.getText500(kb.color), ColorGroupHoverUtils.getText700(kb.color))}'`
                          ) ?? "",
                      }}
                    />
                  ) : item.icon.includes("http") ? (
                    <img className="h-8 w-8" src={item.icon} alt={item.title} />
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex items-center space-x-8">
                  <div className="flex w-full flex-col">
                    <div className="font-bold">{item.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
                    <div className="mt-6 flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">
                          {item.articles.length} <span>{item.articles.length === 1 ? "article" : "articles"}</span>
                        </div>
                      </div>
                      {/* <div className="text-sm text-gray-400">{item.version}</div> */}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
