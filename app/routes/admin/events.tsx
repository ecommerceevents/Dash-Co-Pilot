import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ApplicationEvents } from "~/modules/events/types/ApplicationEvent";
import EventsTable from "~/modules/events/components/EventsTable";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { getTranslations } from "~/locale/i18next.server";
import { EventWithAttempts, getEvents } from "~/modules/events/db/events.db.server";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { useTranslation } from "react-i18next";

type LoaderData = {
  title: string;
  items: EventWithAttempts[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.events.view");
  const { t } = await getTranslations(request);

  const urlSearchParams = new URL(request.url).searchParams;
  const current = getPaginationFromCurrentUrl(urlSearchParams);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "name",
      title: "Event",
      options: ApplicationEvents.map((item) => {
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
      name: "tenantId",
      title: t("models.tenant.object"),
      options: [
        { name: "- No tenant -", value: "{null}" },
        ...(await adminGetAllTenantsIdsAndNames()).map((i) => {
          return { value: i.id, name: i.name };
        }),
      ],
    },
    {
      name: "userId",
      title: t("models.user.object"),
      options: (await adminGetAllUsersNames()).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await getEvents({ current, filters });

  const data: LoaderData = {
    title: `${t("models.event.plural")} | ${process.env.APP_NAME}`,
    items,
    pagination,
    filterableProperties,
  };
  return json(data);
};

export default function AdminEventsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();

  return (
    <IndexPageLayout
      title={t("models.event.plural")}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
        </>
      }
    >
      <EventsTable items={data.items} pagination={data.pagination} />
    </IndexPageLayout>
  );
}
