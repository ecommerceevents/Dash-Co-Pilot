import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ApplicationEvents } from "~/modules/events/types/ApplicationEvent";
import EventsTable from "~/modules/events/components/EventsTable";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { EventWithAttempts, getEvents } from "~/modules/events/db/events.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getUsersByTenant } from "~/utils/db/users.db.server";

type LoaderData = {
  title: string;
  items: EventWithAttempts[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.auditTrails.view", tenantId);
  const { t } = await getTranslations(request);

  const urlSearchParams = new URL(request.url).searchParams;
  const current = getPaginationFromCurrentUrl(urlSearchParams);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "name",
      title: "Event",
      options: ApplicationEvents.filter((f) => !f.adminOnly || !params.tenant).map((item) => {
        return {
          value: item.value,
          name: `${item.value} - ${item.name}`,
        };
      }),
    },
    {
      name: "data",
      title: "Data",
    },
    {
      name: "userId",
      title: "models.user.object",
      options: (await getUsersByTenant(tenantId)).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await getEvents({ current, filters }, tenantId);

  const data: LoaderData = {
    title: `${t("models.event.plural")} | ${process.env.APP_NAME}`,
    items,
    pagination,
    filterableProperties,
  };
  return json(data);
};

export default function AppEventsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();

  return (
    <IndexPageLayout
      title={t("models.event.plural")}
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
      <EventsTable items={data.items} pagination={data.pagination} />
    </IndexPageLayout>
  );
}
