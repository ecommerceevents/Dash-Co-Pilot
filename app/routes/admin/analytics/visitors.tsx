import { AnalyticsUniqueVisitor } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { db } from "~/utils/db.server";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  items: (AnalyticsUniqueVisitor & {
    _count: {
      pageViews: number;
      events: number;
    };
  })[];
  pagination: PaginationDto;
};

export const loader: LoaderFunction = async ({ request }) => {
  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);
  const items = await db.analyticsUniqueVisitor.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include: {
      _count: {
        select: {
          pageViews: true,
          events: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.analyticsUniqueVisitor.count({});
  const data: LoaderData = {
    items,
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
  const data = useTypedLoaderData<LoaderData>();
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
        <div>
          <TableSimple
            items={data.items}
            pagination={data.pagination}
            headers={[
              {
                name: "date",
                title: "Date",
                value: (i) => (
                  <time title={DateUtils.dateYMDHMS(i.createdAt)} className="text-xs text-gray-500">
                    {DateUtils.dateAgo(i.createdAt)}
                  </time>
                ),
              },
              {
                name: "httpReferrer",
                title: "HTTP Referrer",
                value: (i) => i.httpReferrer,
              },
              {
                name: "via",
                title: "Via",
                value: (i) => i.via,
              },
              {
                name: "browser",
                title: "Browser",
                value: (i) => i.browser,
              },
              {
                name: "os",
                title: "OS",
                value: (i) => i.os,
              },
              {
                name: "device",
                title: "Device",
                value: (i) => i.device,
              },
              {
                name: "source",
                title: "Source",
                value: (i) => i.source,
              },
              {
                name: "medium",
                title: "Medium",
                value: (i) => i.medium,
              },
              {
                name: "campaign",
                title: "Campaign",
                value: (i) => i.campaign,
              },
              {
                name: "content",
                title: "Content",
                value: (i) => i.content,
              },
              {
                name: "term",
                title: "Term",
                value: (i) => i.term,
              },
              {
                name: "country",
                title: "Country",
                value: (i) => i.country,
              },
              {
                name: "city",
                title: "City",
                value: (i) => i.city,
              },
              {
                name: "fromUrl",
                title: "From URL",
                value: (i) => i.fromUrl,
              },
              {
                name: "fromRoute",
                title: "From Route",
                value: (i) => i.fromRoute,
              },
              {
                name: "cookie",
                title: "Cookie",
                value: (i) => i.cookie.substring(0, 5) + "...",
              },
            ]}
          />
        </div>
      </IndexPageLayout>
    </>
  );
}
