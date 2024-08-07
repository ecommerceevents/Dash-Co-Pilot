import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import Page404 from "~/components/pages/Page404";
import ServerError from "~/components/ui/errors/ServerError";
import { getTranslations } from "~/locale/i18next.server";
import { BlogPostWithDetails, getBlogPost } from "~/modules/blog/db/blog.db.server";
import BlogPostBlock from "~/modules/pageBlocks/components/blocks/marketing/blog/post/BlogPostBlock";
import FooterBlock from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import UrlUtils from "~/utils/app/UrlUtils";
import { getUser } from "~/utils/db/users.db.server";
import { MetaFunctionArgs } from "~/utils/meta/MetaFunctionArgs";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { getBaseURL } from "~/utils/url.server";

export const meta = ({ data }: MetaFunctionArgs<LoaderData>) => data?.metatags || [];
type LoaderData = {
  metatags: MetaTagsDto;
  post: BlogPostWithDetails | null;
  canEdit: boolean;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  const post = await getBlogPost({ tenantId, idOrSlug: params.postSlug! });
  if (!post) {
    return json({ error: t("shared.notFound") }, { status: 404 });
  }
  if (!post.published && (!user || !user.admin)) {
    return json({ error: t("shared.notFound") }, { status: 404 });
  }
  let metatags: MetaTagsDto = [
    { title: post.title },
    { name: "description", content: post.description },
    { name: "keywords", content: post.tags.map((postTag) => postTag.tag.name).join(",") },
    { property: "og:image", content: post.image },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.description },
    { property: "og:url", content: !tenantId ? `${getBaseURL(request)}/blog/${post.slug}` : `${getBaseURL(request)}/b/${params.tenant}/${post.slug}` },
    { property: "twitter:image", content: post.image },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:title", content: post.title },
    { property: "twitter:description", content: post.description },
    {
      tagName: "link",
      rel: "canonical",
      href: `${getBaseURL(request, { https: true })}/blog/${post.slug}`,
    },
  ];

  const data: LoaderData = {
    metatags,
    post,
    canEdit: user?.admin !== undefined,
  };

  return json(data);
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const { t } = useTranslation();
  const params = useParams();
  return (
    <div>
      <HeaderBlock />
      {!data.post ? (
        <Page404
          withLogo={false}
          customBackButton={
            <Link to={UrlUtils.getBlogPath(params)}>
              <span aria-hidden="true"> &larr;</span> {t("blog.backToBlog")}
            </Link>
          }
        />
      ) : (
        <BlogPostBlock
          item={{
            style: "simple",
            data: {
              post: data.post,
              canEdit: data.canEdit,
            },
          }}
        />
      )}
      <FooterBlock />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
