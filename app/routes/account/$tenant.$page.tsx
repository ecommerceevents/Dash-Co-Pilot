import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { getCurrentPage } from "~/modules/pageBlocks/services/.server/pagesService";
import PageBlocks from "~/modules/pageBlocks/components/blocks/PageBlocks";
import { PageBlockService } from "~/modules/pageBlocks/services/.server/blocksService";
import { PageLoaderData } from "~/modules/pageBlocks/dtos/PageBlockData";
import ServerError from "~/components/ui/errors/ServerError";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import { useTranslation } from "react-i18next";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { useTypedLoaderData } from "remix-typedjson";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  const page = await getCurrentPage({ request, params, slug: "/" + params.page, tenantId });
  if (!page.page && page.blocks.length === 0) {
    return redirect("/404?page=" + params.page);
  }
  return json(page);
};

export const action: ActionFunction = async ({ request, params }) => PageBlockService.action({ request, params });

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<PageLoaderData>();
  return (
    <>
      {data.error ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <ErrorBanner title={t("shared.error")} text={data.error} />
        </div>
      ) : (
        <PageBlocks items={data.blocks} />
      )}
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
