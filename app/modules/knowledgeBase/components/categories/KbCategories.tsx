import type { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import type { KbCategoryDto } from "../../dtos/KbCategoryDto";
import KbCategoriesList from "./KbCategoriesList";
import KbCategoriesGrid from "./KbCategoriesGrid";
import KbCategoriesTopArticles from "./KbCategoriesTopArticles";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

export default function KbCategories({ items, kb }: { items: KbCategoryDto[]; kb: KnowledgeBaseDto }) {
  const { t } = useTranslation();
  return (
    <div>
      {items.length === 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Categories</h2>
          <EmptyState className="bg-white" captions={{ thereAreNo: "There are no categories" }} />
        </div>
      ) : (
        <Fragment>
          {kb.layout === "list" ? (
            <KbCategoriesList kb={kb} items={items} />
          ) : kb.layout === "articles" ? (
            <KbCategoriesTopArticles kb={kb} items={items} />
          ) : kb.layout === "grid" ? (
            <KbCategoriesGrid kb={kb} items={items} columns={3} />
          ) : kb.layout === "docs" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("knowledgeBase.category.plural")}</h2>
              <KbCategoriesGrid kb={kb} items={items} columns={3} />
            </div>
          ) : null}
        </Fragment>
      )}
    </div>
  );
}
