import { useSubmit } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import KbHeader from "../../components/KbHeader";
import KbArticle from "../../components/articles/KbArticle";
import { KbRoutesArticleApi } from "../api/KbRoutes.Article.Api";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import KbDocsLayout from "../../components/layouts/KbDocsLayout";

export default function KbRoutesArticleView() {
  const data = useTypedLoaderData<KbRoutesArticleApi.LoaderData>();
  const submit = useSubmit();

  if (data.kb.layout === "docs") {
    return (
      <KbDocsLayout
        kb={data.kb}
        categories={data.categories}
        article={!data.item ? null : { ...data.item, userState: data.userState }}
        isAdmin={data.isAdmin}
      />
    );
  }

  function onAction(name: string) {
    const form = new FormData();
    form.set("action", name);
    submit(form, {
      method: "post",
    });
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <KbHeader kb={data.kb} withTitleAndDescription={false} withSearch={false} />

      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="space-y-3">
          {data.isAdmin && (
            <div className="flex items-center space-x-2">
              {
                <>
                  <ButtonSecondary to={`/admin/knowledge-base/bases/${data.kb.slug}/articles/${data.item?.article.language}/${data.item?.article.id}`}>
                    <div>Settings</div>
                  </ButtonSecondary>
                  <ButtonSecondary to={`/admin/knowledge-base/bases/${data.kb.slug}/articles/${data.item?.article.language}/${data.item?.article.id}/edit`}>
                    <div>Edit latest</div>
                  </ButtonSecondary>
                </>
              }
            </div>
          )}

          {!data.item ? (
            <div>Not found</div>
          ) : (
            <KbArticle
              kb={data.kb}
              category={data.item.category}
              item={data.item.article}
              userState={{
                hasThumbsUp: data.userState.hasThumbsUp,
                hasThumbsDown: data.userState.hasThumbsDown,
              }}
              actions={{
                onThumbsUp: () => onAction("thumbsUp"),
                onThumbsDown: () => onAction("thumbsDown"),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
