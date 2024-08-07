import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import PostForm from "~/components/blog/PostForm";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { BlogRoutesNewApi } from "../api/BlogRoutes.New.Api";
import UrlUtils from "~/utils/app/UrlUtils";
import { useParams } from "@remix-run/react";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";

export default function BlogNewView() {
  const { t } = useTranslation();
  const params = useParams();
  const data = useTypedLoaderData<BlogRoutesNewApi.LoaderData>();
  return (
    <EditPageLayout
      title={t("blog.new")}
      withHome={false}
      menu={[
        { title: t("blog.title"), routePath: UrlUtils.getModulePath(params, `blog`) },
        { title: t("blog.new"), routePath: UrlUtils.getModulePath(params, `blog/new`) },
      ]}
    >
      <CheckPlanFeatureLimit item={data.featureUsageEntity}>
        <PostForm categories={data.categories} tags={data.tags} />
      </CheckPlanFeatureLimit>
    </EditPageLayout>
  );
}
