import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import ServerError from "~/components/ui/errors/ServerError";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ApiKeyLogsSummary from "~/modules/api/components/ApiKeyLogsSummary";
import { ApiCallSummaryDto } from "~/modules/api/dtos/ApiCallSummaryDto";
import ApiKeyLogService from "~/modules/api/services/ApiKeyLogService";

type LoaderData =
  | { error: string }
  | {
      items: ApiCallSummaryDto[];
      allTenants: { id: string; name: string; slug: string }[];
      filterableProperties: FilterablePropertyDto[];
    };
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const { items, allTenants, filterableProperties } = await ApiKeyLogService.getSummary({ request, params });
    const data: LoaderData = {
      items,
      allTenants,
      filterableProperties,
    };
    return json(data);
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <EditPageLayout title={t("shared.overview")}>
      {"error" in data ? (
        <ErrorBanner title={t(data.error)}>
          <Link to="." className="underline">
            {t("shared.clickHereToTryAgain")}
          </Link>
        </ErrorBanner>
      ) : (
        <Fragment>
          <ApiKeyLogsSummary data={data} />
        </Fragment>
      )}
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
