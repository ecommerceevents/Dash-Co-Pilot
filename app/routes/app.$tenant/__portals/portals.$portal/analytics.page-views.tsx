import { AnalyticsPageView, AnalyticsUniqueVisitor, Portal, Prisma } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useParams, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import InputFilters from "~/components/ui/input/InputFilters";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { getPortalById } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { db } from "~/utils/db.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  portal: Portal;
  items: (AnalyticsPageView & {
    uniqueVisitor: AnalyticsUniqueVisitor & {
      portalUser: { email: string } | null;
    };
  })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
export const loader: LoaderFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    throw new Error("Portal not found");
  }
  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const allRoutes = await db.analyticsPageView.groupBy({
    where: { portalId: portal.id },
    by: ["route"],
  });

  const allUsers = await db.portalUser.findMany({
    where: { portalId: portal.id },
    select: { id: true, email: true },
  });

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "route",
      title: "analytics.route",
      options: allRoutes.map((f) => {
        return { value: f.route ?? "", name: f.route ?? "" };
      }),
    },
    {
      name: "portalUserId",
      title: t("models.user.object"),
      options: allUsers.map((f) => {
        return { value: f.id, name: f.email };
      }),
    },
    {
      name: "cookie",
      title: "Cookie",
      manual: true,
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  let where: Prisma.AnalyticsPageViewWhereInput = {
    portalId: portal.id,
  };

  const routeFilter = filters.properties.find((f) => f.name === "route");
  if (routeFilter?.value) {
    where = { ...where, route: routeFilter.value === "null" ? null : routeFilter.value };
  }

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, uniqueVisitor: { cookie: cookieFilter.value === "null" ? undefined : cookieFilter.value } };
  }

  const portalUserFilter = filters.properties.find((f) => f.name === "portalUserId");
  if (portalUserFilter?.value) {
    where = { ...where, uniqueVisitor: { portalUserId: portalUserFilter.value === "null" ? null : portalUserFilter.value } };
  }
  const items = await db.analyticsPageView.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      uniqueVisitor: {
        include: {
          user: {
            select: { email: true },
          },
          portalUser: {
            select: { email: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.analyticsPageView.count({
    where,
  });
  const data: LoaderData = {
    portal,
    items,
    filterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <EditPageLayout
        withHome={false}
        tabs={[
          {
            name: t("analytics.overview"),
            routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics`),
          },
          {
            name: t("analytics.uniqueVisitors"),
            routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics/visitors`),
          },
          {
            name: t("analytics.pageViews"),
            routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics/page-views`),
          },
          {
            name: t("analytics.events"),
            routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/analytics/events`),
          },
        ]}
        title={t("analytics.pageViews")}
        buttons={
          <>
            <InputFilters filters={data.filterableProperties} />
          </>
        }
      >
        <div className="space-y-2">
          <TableSimple
            items={data.items}
            pagination={data.pagination}
            headers={[
              {
                name: "date",
                title: "Date",
                value: (i) => (
                  <div className="flex flex-col">
                    <div>
                      {i.uniqueVisitor.portalUser ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              if (searchParams.get("portalUserId") || !i.uniqueVisitor.portalUserId) {
                                searchParams.delete("portalUserId");
                              } else {
                                searchParams.set("portalUserId", i.uniqueVisitor.portalUserId);
                              }
                              setSearchParams(searchParams);
                            }}
                            disabled={!i.uniqueVisitor.portalUserId}
                            className="underline"
                          >
                            <div className="text-xs text-gray-800">{i.uniqueVisitor.portalUser.email}</div>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (searchParams.get("cookie")) {
                              searchParams.delete("cookie");
                            } else {
                              searchParams.set("cookie", i.uniqueVisitor.cookie);
                            }
                            setSearchParams(searchParams);
                          }}
                          className="underline"
                        >
                          <div className="text-xs text-gray-500">
                            <span className="">Anon</span>: {i.uniqueVisitor.cookie.substring(0, 5) + "..."}
                          </div>
                        </button>
                      )}
                    </div>
                    <time title={DateUtils.dateYMDHMS(i.createdAt)} className="text-xs text-gray-500">
                      {DateUtils.dateAgo(i.createdAt)}
                    </time>
                  </div>
                ),
              },
              {
                name: "url",
                title: "URL",
                value: (i) => (
                  <div className="max-w-xs truncate">
                    <div className="truncate font-medium">{i.url}</div>
                    <button
                      type="button"
                      onClick={() => {
                        searchParams.set("route", i.route ?? "null");
                        setSearchParams(searchParams);
                      }}
                      className="truncate underline"
                    >
                      <div className="text-xs text-gray-500">{i.url !== i.route && i.route}</div>
                    </button>
                  </div>
                ),
              },
              {
                name: "httpReferrer",
                title: "HTTP Referrer",
                value: (i) => <div className="max-w-xs truncate">{i.uniqueVisitor.httpReferrer}</div>,
              },
              {
                name: "via",
                title: "Via",
                value: (i) => i.uniqueVisitor.via,
              },
              {
                name: "browser",
                title: "Browser",
                value: (i) => i.uniqueVisitor.browser,
              },
              {
                name: "os",
                title: "OS",
                value: (i) => i.uniqueVisitor.os,
              },
              {
                name: "device",
                title: "Device",
                value: (i) => i.uniqueVisitor.device,
              },
              {
                name: "source",
                title: "Source",
                value: (i) => i.uniqueVisitor.source,
              },
              {
                name: "medium",
                title: "Medium",
                value: (i) => i.uniqueVisitor.medium,
              },
              {
                name: "campaign",
                title: "Campaign",
                value: (i) => i.uniqueVisitor.campaign,
              },
              {
                name: "content",
                title: "Content",
                value: (i) => i.uniqueVisitor.content,
              },
              {
                name: "term",
                title: "Term",
                value: (i) => i.uniqueVisitor.term,
              },
              {
                name: "country",
                title: "Country",
                value: (i) => i.uniqueVisitor.country,
              },
              {
                name: "city",
                title: "City",
                value: (i) => i.uniqueVisitor.city,
              },
              {
                name: "fromUrl",
                title: "From url",
                value: (i) => (
                  <div className="max-w-xs truncate">
                    <div className="truncate font-medium">{i.uniqueVisitor.fromUrl}</div>
                    <div className="text-xs text-gray-500">{i.uniqueVisitor.fromUrl !== i.uniqueVisitor.fromRoute && i.uniqueVisitor.fromRoute}</div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </EditPageLayout>
    </>
  );
}
