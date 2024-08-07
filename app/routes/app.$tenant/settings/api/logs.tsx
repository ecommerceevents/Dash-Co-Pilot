import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import ApiKeyLogsDetails from "~/modules/api/components/ApiKeyLogsDetails";
import { ApiKeyLogDto } from "~/modules/api/dtos/ApiKeyLogDto";
import ApiKeyLogService from "~/modules/api/services/ApiKeyLogService";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  items: ApiKeyLogDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { items, filterableProperties, pagination } = await ApiKeyLogService.getDetails({ request, params });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination,
  };
  return json(data);
};

export default function AdminApiLogsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  return (
    <IndexPageLayout
      replaceTitleWithTabs={true}
      tabs={[
        {
          name: t("shared.overview"),
          routePath: UrlUtils.getModulePath(params, "api"),
        },
        {
          name: t("models.apiCall.plural"),
          routePath: UrlUtils.getModulePath(params, "api/logs"),
        },
        {
          name: t("models.apiKey.plural"),
          routePath: UrlUtils.getModulePath(params, "api/keys"),
        },
        {
          name: "Docs",
          routePath: UrlUtils.getModulePath(params, "api/docs"),
        },
      ]}
    >
      <ApiKeyLogsDetails data={data} />
    </IndexPageLayout>
  );
}
