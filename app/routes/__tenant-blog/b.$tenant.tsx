import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import ServerError from "~/components/ui/errors/ServerError";
import { getAllBlogPosts } from "~/modules/blog/db/blog.db.server";
import { BlogPostDto } from "~/modules/blog/dtos/BlogPostDto";
import BlogPostsBlock from "~/modules/pageBlocks/components/blocks/marketing/blog/posts/BlogPostsBlock";
import FooterBlock from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import HeadingBlock from "~/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import { TenantSimple, getTenantSimple } from "~/utils/db/tenants.db.server";
import { MetaFunctionArgs } from "~/utils/meta/MetaFunctionArgs";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";

export const meta = ({ data }: MetaFunctionArgs<LoaderData>) => data?.metatags || [];
type LoaderData = {
  metatags: MetaTagsDto;
  tenant: TenantSimple | null;
  items: BlogPostDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  const tenant = await getTenantSimple(tenantId);
  if (!tenant) {
    return json({ error: "Not found" }, { status: 404 });
  }
  const data: LoaderData = {
    metatags: [{ title: `${tenant.name} | Blog | ${process.env.APP_NAME}` }],
    tenant: tenantId ? await getTenantSimple(tenantId) : null,
    items: await getAllBlogPosts({ tenantId, published: true }),
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div>
      <HeaderBlock />
      <div className="py-4">
        <HeadingBlock
          item={{
            style: "centered",
            headline: !data.tenant ? t("blog.title") : `${data.tenant?.name} ${t("blog.title")}`,
            subheadline: !data.tenant ? t("blog.headline") : "",
          }}
        />
      </div>
      <BlogPostsBlock
        item={{
          style: "simple",
          withCoverImage: true,
          withAuthorName: true,
          withAuthorAvatar: true,
          withDate: true,
          blogPath: data.tenant ? `/b/${data.tenant.slug}` : "/blog",
          data: data.items,
        }}
      />
      <FooterBlock />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
