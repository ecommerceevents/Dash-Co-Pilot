import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Link, useLocation, useNavigate, useOutlet, useParams } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { EntityViewWithTenantAndUser, getAllEntityViews } from "~/utils/db/entities/entityViews.db.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import ServerError from "~/components/ui/errors/ServerError";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import { Menu } from "@headlessui/react";
import Dropdown from "~/components/ui/dropdowns/Dropdown";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import clsx from "clsx";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import InputFilters from "~/components/ui/input/InputFilters";
import EntityViewsTable from "~/components/entities/views/EntityViewsTable";
import { getAllEntitiesSimple } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  metatags: MetaTagsDto;
  items: EntityViewWithTenantAndUser[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.entities.view");
  const searchParams = new URL(request.url).searchParams;
  let type = searchParams.get("type");
  if (type && ["default", "tenant", "user", "system"].includes(type) === false) {
    return redirect("/admin/entities/views/all");
  }

  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "entityId",
      title: t("models.entity.object"),
      options: (await getAllEntitiesSimple()).map((item) => {
        return {
          value: item.id,
          name: `${t(item.title)} (${item.name})`,
        };
      }),
    },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      options: (await adminGetAllTenantsIdsAndNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
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

  const { items, total } = await getAllEntityViews({
    type: type ?? undefined,
    pagination: { pageSize: pagination.pageSize, page: pagination.page },
    filters,
  });
  const data: LoaderData = {
    metatags: [{ title: `${t("models.view.plural")} | ${process.env.APP_NAME}` }],
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
    filterableProperties,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "") {
    return json({ error: "TODO" }, { status: 400 });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return (
    <EditPageLayout
      title={
        <TabsWithIcons
          breakpoint="lg"
          tabs={[
            {
              name: "All",
              href: "/admin/entities/views",
              current: location.pathname + location.search === "/admin/entities/views",
            },
            {
              name: "All accounts",
              href: "/admin/entities/views?type=default",
              current: location.pathname + location.search === "/admin/entities/views?type=default",
            },
            {
              name: t("models.view.types.tenant"),
              href: "/admin/entities/views?type=tenant",
              current: location.pathname + location.search === "/admin/entities/views?type=tenant",
            },
            {
              name: t("models.view.types.user"),
              href: "/admin/entities/views?type=user",
              current: location.pathname + location.search === "/admin/entities/views?type=user",
            },
            {
              name: t("models.view.types.system"),
              href: "/admin/entities/views?type=system",
              current: location.pathname + location.search === "/admin/entities/views?type=system",
            },
          ]}
        />
      }
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} withSearch={false} />
          <Dropdown
            right={false}
            button={<span>{t("shared.add")} view</span>}
            disabled={appOrAdminData.entities.length === 0}
            options={
              <div>
                {appOrAdminData.entities
                  .filter((f) => f.hasViews)
                  .map((f) => {
                    return (
                      <Menu.Item key={f.id}>
                        {({ active }) => (
                          <Link
                            to={`/admin/entities/views/new/${f.name}${location.search}`}
                            className={clsx("w-full truncate", active ? "bg-gray-100 text-gray-900" : "text-gray-700", "block px-4 py-2 text-sm")}
                          >
                            <div className="truncate">
                              {t(f.title)} <span className="text-xs text-gray-400">({f.name})</span>
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                    );
                  })}
              </div>
            }
          ></Dropdown>
        </>
      }
    >
      <EntityViewsTable
        items={data.items}
        onClickRoute={(i) => {
          return `/admin/entities/views/${i.id}${location.search}`;
        }}
      />

      <SlideOverWideEmpty
        title={params.id ? "Edit view" : params.entity ? `New ${params.entity} view` : "New view"}
        open={!!outlet}
        onClose={() => {
          navigate("." + location.search, { replace: true });
        }}
        className="sm:max-w-2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
