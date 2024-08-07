import { useLocation, useSubmit } from "@remix-run/react";
import { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import { KbCategoryDto } from "../../dtos/KbCategoryDto";
import clsx from "clsx";
import { MobileNav } from "~/components/ui/docs/DocsMobileNav";
import { Fragment } from "react";
import RightIcon from "~/components/ui/icons/RightIcon";
import { ScrollArea } from "~/components/ui/scroll-area";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { KbArticleDto } from "../../dtos/KbArticleDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import KbArticle from "../articles/KbArticle";
import KnowledgeBaseUtils from "../../utils/KnowledgeBaseUtils";
import KbDocsHeader from "./KbDocsHeader";
import KbFeaturedArticles from "../KbFeaturedArticles";
import KbCategories from "../categories/KbCategories";
import { DocsSidebarNav } from "~/components/ui/docs/DocsSidebarNav";

export default function KbDocsLayout({
  kb,
  categories,
  featured,
  article,
  isAdmin,
}: {
  kb: KnowledgeBaseDto;
  categories: KbCategoryDto[];
  featured?: KbArticleDto[];
  article?: {
    article: KbArticleDto;
    category: KbCategoryDto;
    userState: {
      hasThumbsUp: boolean;
      hasThumbsDown: boolean;
    };
  } | null;
  isAdmin: boolean;
}) {
  // const outlet = useOutlet();
  const location = useLocation();

  const items: SideBarItem[] = [];
  categories.forEach((category) => {
    const sections = KnowledgeBaseUtils.getCategoryArticlesBySections({ kb, category });
    items.push({
      title: category.title,
      path: category.href,
      items: [],
    });
    let categoryItem = items[items.length - 1];
    sections.forEach((section) => {
      if (section.articles.length === 0) return;
      if (section.section) {
        items.push({
          title: section.section.title,
          path: "",
          items: [],
        });
        categoryItem = items[items.length - 1];
      }
      section.articles.forEach((article) => {
        categoryItem.items?.push({
          title: article.title,
          path: article.href,
        });
      });
    });
  });

  const currentItem = () => {
    const findRecursive = (items: SideBarItem[]): SideBarItem | undefined => {
      for (const item of items) {
        if (item.path && item.title && item.path === location.pathname) return item;
        if (item.items) {
          const found = findRecursive(item.items);
          if (found) return found;
        }
      }
    };
    return findRecursive(items);
  };

  return (
    <div>
      <KbDocsHeader kb={kb} />
      <div className="mx-auto max-w-screen-2xl flex-1 items-start px-4 pt-3 sm:px-6 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <nav className={clsx("not-prose border-border mb-2 flex items-center truncate border-b pb-2 md:hidden")}>
          <ol className="flex items-center space-x-2">
            <MobileNav items={items} />
            {currentItem() && (
              <Fragment>
                <RightIcon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <div>
                  <h3 className="text-muted-foreground text-base">{currentItem()?.title}</h3>
                </div>
              </Fragment>
            )}
          </ol>
        </nav>
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-90px)] w-full shrink-0 md:sticky md:block">
          <ScrollArea className="h-full pb-6 pr-6 lg:pb-8">
            <DocsSidebarNav items={items} />
          </ScrollArea>
        </aside>
        {article ? (
          <Article kb={kb} article={article} isAdmin={isAdmin} />
        ) : (
          <div>
            <div className="mx-auto max-w-5xl px-2 py-6 sm:px-8">
              <div className="space-y-8">
                {featured && featured.length > 0 && <KbFeaturedArticles kb={kb} items={featured} />}
                <KbCategories kb={kb} items={categories} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Article({
  kb,
  article,
  isAdmin,
}: {
  kb: KnowledgeBaseDto;
  article: {
    article: KbArticleDto;
    category: KbCategoryDto;
    userState: {
      hasThumbsUp: boolean;
      hasThumbsDown: boolean;
    };
  };
  isAdmin: boolean;
}) {
  const submit = useSubmit();
  function onAction(name: string) {
    const form = new FormData();
    form.set("action", name);
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="px-2 py-2 sm:px-8 sm:py-8">
      <div className="space-y-3">
        {isAdmin && (
          <div className="flex items-center space-x-2">
            {
              <>
                <ButtonSecondary to={`/admin/knowledge-base/bases/${kb.slug}/articles/${article?.article.language}/${article?.article.id}`}>
                  <div>Settings</div>
                </ButtonSecondary>
                <ButtonSecondary to={`/admin/knowledge-base/bases/${kb.slug}/articles/${article?.article.language}/${article?.article.id}/edit`}>
                  <div>Edit latest</div>
                </ButtonSecondary>
              </>
            }
          </div>
        )}

        <KbArticle
          kb={kb}
          category={article.category}
          item={article.article}
          userState={{
            hasThumbsUp: article.userState.hasThumbsUp,
            hasThumbsDown: article.userState.hasThumbsDown,
          }}
          actions={{
            onThumbsUp: () => onAction("thumbsUp"),
            onThumbsDown: () => onAction("thumbsDown"),
          }}
          withMenu={false}
        />
      </div>
    </div>
  );
}

// function getArticles({ kb, category, sectionId }: { kb: KnowledgeBaseDto; category: KbCategoryDto; sectionId: string | null }) {
//   return category.articles
//     .filter((f) => f.publishedAt !== null && (sectionId ? f.sectionId === sectionId : true))
//     .sort((a, b) => a.order - b.order)
//     .map((article) => ({
//       title: article.title,
//       path: KnowledgeBaseUtils.getArticleUrl({ kb, article, params: {} }),
//     }));
// }
