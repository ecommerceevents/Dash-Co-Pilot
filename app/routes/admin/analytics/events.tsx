import { AnalyticsEvent, AnalyticsUniqueVisitor } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getFeatureFlags } from "~/modules/featureFlags/db/featureFlags.db.server";
import { db } from "~/utils/db.server";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  items: (AnalyticsEvent & { uniqueVisitor: AnalyticsUniqueVisitor })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
export const loader: LoaderFunction = async ({ request }) => {
  const allActions = await db.analyticsEvent.groupBy({
    by: ["action"],
  });
  const allCategories = await db.analyticsEvent.groupBy({
    where: { category: { not: null } },
    by: ["category"],
  });
  const allLabels = await db.analyticsEvent.groupBy({
    where: { label: { not: null } },
    by: ["label"],
  });
  const allValues = await db.analyticsEvent.groupBy({
    where: { value: { not: null } },
    by: ["value"],
  });
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "action",
      title: "analytics.action",
      options: allActions.map((f) => {
        return { value: f.action, name: f.action };
      }),
    },
    {
      name: "category",
      title: "analytics.category",
      options: allCategories.map((f) => {
        return { value: f.category ?? "", name: f.category ?? "" };
      }),
    },
    {
      name: "label",
      title: "analytics.label",
      options: allLabels.map((f) => {
        return { value: f.label ?? "", name: f.label ?? "" };
      }),
    },
    {
      name: "value",
      title: "analytics.value",
      options: allValues.map((f) => {
        return { value: f.value ?? "", name: f.value ?? "" };
      }),
    },
    {
      name: "featureFlagId",
      title: "featureFlags.object",
      options: (await getFeatureFlags({ enabled: undefined })).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);

  const searchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(searchParams);
  const items = await db.analyticsEvent.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include: { uniqueVisitor: true },
    orderBy: {
      createdAt: "desc",
    },
    where: RowFiltersHelper.getFiltersCondition(filters),
  });
  const totalItems = await db.analyticsEvent.count({});
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

export default function AdminAnalyticsEventsOverviewRoute() {
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("analytics.events")}</h1>
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
                  <time title={DateUtils.dateYMDHMS(i.createdAt)} className="text-xs text-gray-500">
                    {DateUtils.dateAgo(i.createdAt)}
                  </time>
                ),
              },
              {
                name: "action",
                title: "Action",
                value: (i) => i.action,
              },
              {
                name: "category",
                title: "Category",
                value: (i) => i.category,
              },
              {
                name: "label",
                title: "Label",
                value: (i) => i.label,
              },
              {
                name: "value",
                title: "Value",
                value: (i) => i.value,
              },
              {
                name: "url",
                title: "URL",
                value: (i) => i.url,
              },
              {
                name: "cookie",
                title: "Cookie",
                value: (i) => <div className="truncate">{i.uniqueVisitor.cookie}</div>,
                className: "max-w-xs",
              },
              {
                name: "httpReferrer",
                title: "HTTP Referrer",
                value: (i) => i.uniqueVisitor.httpReferrer,
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
                title: "From URL",
                value: (i) => i.uniqueVisitor.fromUrl,
              },
              {
                name: "fromRoute",
                title: "From Route",
                value: (i) => i.uniqueVisitor.fromRoute,
              },
            ]}
          />
        </div>
      </IndexPageLayout>
    </>
  );
}
