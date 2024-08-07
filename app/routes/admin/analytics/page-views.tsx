import { AnalyticsPageView, AnalyticsUniqueVisitor, Prisma } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useRootData } from "~/utils/data/useRootData";
import { db } from "~/utils/db.server";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  items: (AnalyticsPageView & {
    uniqueVisitor: AnalyticsUniqueVisitor & {
      user: { email: string } | null;
    };
    portal: { id: string; title: string } | null;
  })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
export const loader: LoaderFunction = async ({ request }) => {
  const appConfiguration = await getAppConfiguration({ request });
  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const allRoutes = await db.analyticsPageView.groupBy({
    by: ["route"],
  });

  const allUserIds = await db.analyticsUniqueVisitor.groupBy({
    by: ["userId"],
  });
  const allUsers = await getUsersById(allUserIds.map((f) => f.userId ?? ""));

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "route",
      title: "analytics.route",
      options: allRoutes.map((f) => {
        return { value: f.route ?? "", name: f.route ?? "" };
      }),
    },
    {
      name: "userId",
      title: "models.user.object",
      manual: true,
      options: [
        { name: "{Anon}", value: "null" },
        ...allUsers.map((f) => {
          return { value: f.id, name: f.email };
        }),
      ],
    },
    {
      name: "cookie",
      title: "Cookie",
      manual: true,
    },
  ];
  if (appConfiguration.portals?.enabled && appConfiguration.portals?.analytics) {
    filterableProperties.push({
      name: "portalId",
      title: "Portal",
      options: [
        {
          value: "null",
          name: "- None -",
        },
        ...(await db.portal.findMany({ select: { id: true, title: true } }).then((f) => f.map((p) => ({ value: p.id, name: p.title })))),
      ],
    });
  }
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  let where: Prisma.AnalyticsPageViewWhereInput = RowFiltersHelper.getFiltersCondition(filters);

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, uniqueVisitor: { cookie: cookieFilter.value } };
  }

  const userFilter = filters.properties.find((f) => f.name === "userId");
  if (userFilter?.value) {
    where = { ...where, uniqueVisitor: { userId: userFilter.value === "null" ? null : userFilter.value } };
  }

  const items = await db.analyticsPageView.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include: {
      uniqueVisitor: {
        include: {
          user: {
            select: { email: true },
          },
        },
      },
      portal: { select: { id: true, title: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
    where,
  });
  const totalItems = await db.analyticsPageView.count({});
  const data: LoaderData = {
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

export default function AdminAnalyticsPageViewsOverviewRoute() {
  const { t } = useTranslation();
  const rootData = useRootData();
  const data = useTypedLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const portalsConfig = rootData?.appConfiguration.portals;
  return (
    <>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("analytics.overview"),
            routePath: "/admin/analytics/overview",
          },
          {
            name: t("analytics.uniqueVisitors"),
            routePath: "/admin/analytics/visitors",
          },
          {
            name: t("analytics.pageViews"),
            routePath: "/admin/analytics/page-views",
          },
          {
            name: t("analytics.events"),
            routePath: "/admin/analytics/events",
          },
          {
            name: t("analytics.settings"),
            routePath: "/admin/analytics/settings",
          },
        ]}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("analytics.pageViews")}</h1>
            <InputFilters filters={data.filterableProperties} />
          </div>
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
                      <div>
                        {i.uniqueVisitor.user ? (
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!i.uniqueVisitor.userId) return;
                                searchParams.set("userId", i.uniqueVisitor.userId);
                                setSearchParams(searchParams);
                              }}
                              disabled={!i.uniqueVisitor.userId}
                              className="underline"
                            >
                              <div className="text-xs text-gray-800">{i.uniqueVisitor.user.email}</div>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              searchParams.set("cookie", i.uniqueVisitor.cookie);
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
                name: "portal",
                title: "Portal",
                value: (i) => <div className="text-muted-foreground font-medium">{i.portal?.title}</div>,
                hidden: !portalsConfig?.enabled || !portalsConfig?.analytics,
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
      </IndexPageLayout>
    </>
  );
}
