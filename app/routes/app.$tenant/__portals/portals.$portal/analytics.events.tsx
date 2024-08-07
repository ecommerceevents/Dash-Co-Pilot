import { AnalyticsEvent, AnalyticsUniqueVisitor, Portal, Prisma } from "@prisma/client";
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
  items: (AnalyticsEvent & {
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
  const allActions = await db.analyticsEvent.groupBy({
    by: ["action"],
    where: {
      portalId: portal.id,
    },
  });
  const allCategories = await db.analyticsEvent.groupBy({
    where: {
      portalId: portal.id,
      category: { not: null },
    },
    by: ["category"],
  });
  const allLabels = await db.analyticsEvent.groupBy({
    where: {
      portalId: portal.id,
      label: { not: null },
    },
    by: ["label"],
  });
  const allValues = await db.analyticsEvent.groupBy({
    where: {
      portalId: portal.id,
      value: { not: null },
    },
    by: ["value"],
  });

  const allUsers = await db.portalUser.findMany({
    where: { portalId: portal.id },
    select: { id: true, email: true },
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
  let where: Prisma.AnalyticsEventWhereInput = {
    portalId: portal.id,
  };

  const actionFilter = filters.properties.find((f) => f.name === "action");
  if (actionFilter?.value) {
    where = { ...where, action: actionFilter.value };
  }

  const categoryFilter = filters.properties.find((f) => f.name === "category");
  if (categoryFilter?.value) {
    where = { ...where, category: categoryFilter.value };
  }
  const labelFilter = filters.properties.find((f) => f.name === "label");
  if (labelFilter?.value) {
    where = { ...where, label: labelFilter.value };
  }
  const valueFilter = filters.properties.find((f) => f.name === "value");
  if (valueFilter?.value) {
    where = { ...where, value: valueFilter.value };
  }

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, uniqueVisitor: { cookie: cookieFilter.value === "null" ? undefined : cookieFilter.value } };
  }

  const portalUserFilter = filters.properties.find((f) => f.name === "portalUserId");
  if (portalUserFilter?.value) {
    where = { ...where, uniqueVisitor: { portalUserId: portalUserFilter.value === "null" ? null : portalUserFilter.value } };
  }

  const searchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(searchParams);
  const items = await db.analyticsEvent.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      uniqueVisitor: {
        include: {
          portalUser: { select: { email: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.analyticsEvent.count({
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
        title={t("analytics.events")}
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
        buttons={
          <>
            <InputFilters filters={data.filterableProperties} />
          </>
        }
      >
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
      </EditPageLayout>
    </>
  );
}
