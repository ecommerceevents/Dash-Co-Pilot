import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { BlogRoutesIndexApi } from "../api/BlogRoutes.Index.Api";
import PostsTable from "~/components/blog/PostsTable";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { useParams } from "@remix-run/react";

export default function BlogView() {
  const { t } = useTranslation();
  const params = useParams();
  const data = useTypedLoaderData<BlogRoutesIndexApi.LoaderData>();

  function blogPath() {
    return params.tenant ? `/b/${params.tenant}` : "/blog";
  }
  return (
    <EditPageLayout
      title={t("models.post.plural")}
      buttons={
        <>
          <ButtonSecondary to={blogPath()} target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <div>{t("shared.preview")}</div>
          </ButtonSecondary>
          <ButtonPrimary to={UrlUtils.getModulePath(params, "blog/new")}>
            <span>{t("blog.write")}</span>
          </ButtonPrimary>
        </>
      }
    >
      <div className="mx-auto max-w-5xl space-y-2 px-4 pb-10 pt-2 sm:px-6 lg:px-8 xl:max-w-7xl">
        <div>
          <div className="text-sm font-bold text-gray-800">Total views: {data.views.length}</div>
        </div>
        <PostsTable blogPath={blogPath()} items={data.items} views={data.views} />
      </div>
    </EditPageLayout>
  );
}
