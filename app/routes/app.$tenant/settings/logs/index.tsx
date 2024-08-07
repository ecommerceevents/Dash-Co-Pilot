import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import LogsTable from "~/components/app/events/LogsTable";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { getLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";

type LoaderData = {
  items: LogWithDetails[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.auditTrails.view", tenantId);

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "action",
      title: "models.log.action",
    },
    {
      name: "url",
      title: "models.log.url",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await getLogs(tenantId, currentPagination, filters);

  const data: LoaderData = {
    items,
    pagination,
    filterableProperties,
  };
  return json(data);
};

export default function Events() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  return (
    <IndexPageLayout
      title={t("models.log.plural")}
      buttons={<InputFilters filters={data.filterableProperties} />}
      replaceTitleWithTabs={true}
      tabs={[
        {
          name: t("models.log.plural"),
          routePath: UrlUtils.getModulePath(params, "logs"),
        },
        {
          name: t("models.event.plural"),
          routePath: UrlUtils.getModulePath(params, "logs/events"),
        },
      ]}
    >
      <LogsTable withTenant={false} items={data.items} pagination={data.pagination} />
    </IndexPageLayout>
  );
}
