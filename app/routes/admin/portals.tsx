import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { useTranslation } from "react-i18next";
import InputFilters from "~/components/ui/input/InputFilters";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import TableSimple from "~/components/ui/tables/TableSimple";
import { deletePortal, getAllPortals, PortalWithCount } from "~/modules/portals/db/portals.db.server";
import DateCell from "~/components/ui/dates/DateCell";
import { useRootData } from "~/utils/data/useRootData";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import ServerError from "~/components/ui/errors/ServerError";
import { FilterableValueLink } from "~/components/ui/links/FilterableValueLink";
import { Link, useSubmit } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { useEffect } from "react";
import toast from "react-hot-toast";
import PortalServer from "~/modules/portals/services/Portal.server";

type LoaderData = {
  items: PortalWithCount[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.portals?.enabled) {
    throw json({ error: "Portals are not enabled" }, { status: 400 });
  }
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      options: [
        { value: "null", name: "{null}" },
        ...(await adminGetAllTenantsIdsAndNames()).map((item) => {
          return {
            value: item.id,
            name: item.name,
          };
        }),
      ],
    },
    {
      name: "userId",
      title: t("models.user.object"),
      options: [
        { value: "null", name: "{null}" },
        ...(await adminGetAllUsersNames()).map((item) => {
          return {
            value: item.id,
            name: item.email,
          };
        }),
      ],
    },
  ];
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination }: { items: (PortalWithCount & { portalUrl?: string })[]; pagination: PaginationDto } = await getAllPortals({
    filters,
    filterableProperties,
    pagination: currentPagination,
  });
  items.forEach((item) => {
    item.portalUrl = PortalServer.getPortalUrl(item);
  });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    try {
      await deletePortal(id);
      return json({ success: t("shared.deleted") });
    } catch (e: any) {
      return json({ error: e }, { status: 400 });
    }
  }
};

export default function () {
  const { t } = useTranslation();
  const rootData = useRootData();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <EditPageLayout title={t("models.portal.plural")}>
      {!rootData.appConfiguration.portals?.enabled && (
        <WarningBanner title={t("shared.warning")}>
          Portals are not enabled. Enabled it at <code className="font-bold">app/utils/db/appConfiguration.db.server.ts</code>.
        </WarningBanner>
      )}
      <div className="space-y-2">
        <div className="flex w-full items-center space-x-2">
          <div className="flex-grow">
            <InputSearchWithURL />
          </div>
          <InputFilters filters={data.filterableProperties} />
        </div>
        <TableSimple
          items={data.items}
          pagination={data.pagination}
          actions={[
            {
              title: t("shared.overview"),
              onClickRoute: (_, item) => (item.tenant ? `/app/${item.tenant.slug}/portals/${item.id}` : `/admin/portals/${item.id}`),
              // onClickRouteTarget: "_blank",
            },
            {
              title: t("shared.delete"),
              onClick: (_, item) => {
                const form = new FormData();
                form.append("action", "delete");
                form.append("id", item.id);
                submit(form, {
                  method: "post",
                });
              },
              destructive: true,
              confirmation: (i) => ({
                title: t("shared.delete"),
                description: t("shared.warningCannotUndo"),
              }),
              // onClickRouteTarget: "_blank",
            },
          ]}
          headers={[
            {
              name: "tenant",
              title: t("models.tenant.object"),
              value: (item) => <FilterableValueLink name="tenantId" value={item?.tenant?.name ?? "{Admin}"} param={item?.tenant?.id ?? "null"} />,
            },
            {
              name: "title",
              title: t("models.portal.object"),
              className: "w-full",
              value: (item) => (
                <div
                  // to={item.tenant ? `/app/${item.tenant.slug}/portals/${item.id}` : `/admin/portals/${item.id}`}
                  className="flex flex-col"
                >
                  <div>
                    {item.title}{" "}
                    <Link to={item.subdomain} target="_blank" className="text-muted-foreground text-sm hover:underline">
                      ({item.subdomain})
                    </Link>
                  </div>
                </div>
              ),
            },
            {
              name: "users",
              title: "Users",
              value: (item) => <div>{item._count.users}</div>,
            },
            {
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (i) => <DateCell date={i.createdAt ?? null} />,
            },
            // {
            //   name: "createdBy",
            //   title: t("shared.createdBy"),
            //   value: (i) => (i.createdByUser ? <UserBadge item={i.createdByUser} /> : <div>-</div>),
            // },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
