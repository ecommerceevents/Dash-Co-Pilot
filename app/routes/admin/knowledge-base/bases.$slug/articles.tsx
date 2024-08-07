import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { KnowledgeBaseArticleWithDetails, getAllKnowledgeBaseArticles } from "~/modules/knowledgeBase/db/kbArticles.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "~/modules/knowledgeBase/utils/KnowledgeBaseUtils";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseArticleWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  if (!knowledgeBase) {
    return redirect("/admin/knowledge-base/bases");
  }
  const items = await getAllKnowledgeBaseArticles({
    knowledgeBaseSlug: params.slug!,
    language: undefined,
  });
  const data: LoaderData = {
    knowledgeBase,
    items,
  };
  return json(data);
};
export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  return (
    <EditPageLayout
      title="Articles"
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
        { title: "Articles", routePath: `/admin/knowledge-base/bases/${params.slug}/articles` },
      ]}
    >
      <div className="space-y-2">
        {data.knowledgeBase.languages.map((f) => {
          return (
            <div key={f} className="space-y-2">
              <Link
                to={f}
                className="relative block space-y-2 rounded-lg border-2 border-dashed border-gray-300 px-12 py-6 text-center hover:border-gray-400 focus:border-solid focus:outline-none"
              >
                <div className="font-bold">{KnowledgeBaseUtils.getLanguageName(f)}</div>
                <div className="text-sm">{data.items.filter((x) => x.language === f).length} articles</div>
              </Link>
            </div>
          );
        })}
      </div>
    </EditPageLayout>
  );
}
