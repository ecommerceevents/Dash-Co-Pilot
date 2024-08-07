import EmptyState from "~/components/ui/emptyState/EmptyState";
import type { KbCategoryDto } from "../../dtos/KbCategoryDto";
import type { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import KbArticles from "./KbArticles";
import KnowledgeBaseUtils from "../../utils/KnowledgeBaseUtils";

export default function KbArticlesBySection({ kb, item }: { kb: KnowledgeBaseDto; item: KbCategoryDto }) {
  return (
    <div>
      {item.articles.length === 0 ? (
        <EmptyState className="bg-white" captions={{ thereAreNo: "No articles" }} />
      ) : (
        <div className="space-y-6">
          {KnowledgeBaseUtils.getCategoryArticlesBySections({ kb, category: item }).map((item, idx) => {
            return (
              <div key={idx} className="space-y-3">
                {item.section && (
                  <div className="flex items-center space-x-2">
                    <div className="text-xl font-bold">{item.section.title}</div>
                  </div>
                )}
                <KbArticles kb={kb} items={item.articles} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
