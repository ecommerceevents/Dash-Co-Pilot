import { AnalyticsUniqueVisitor, Portal, Prisma } from "@prisma/client";
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
  items: (AnalyticsUniqueVisitor & {
    portalUser: { email: string } | null;
    _count: {
      pageViews: number;
      events: number;
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
  const allUsers = await db.portalUser.findMany({
    where: { portalId: portal.id },
    select: { id: true, email: true },
  });

  const filterableProperties: FilterablePropertyDto[] = [
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
  let where: Prisma.AnalyticsUniqueVisitorWhereInput = {
    portalId: portal.id,
  };

  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const cookieFilter = filters.properties.find((f) => f.name === "cookie");
  if (cookieFilter?.value) {
    where = { ...where, cookie: cookieFilter.value };
  }

  const portalUserFilter = filters.properties.find((f) => f.name === "portalUserId");
  if (portalUserFilter?.value) {
    where = { ...where, portalUserId: portalUserFilter.value === "null" ? null : portalUserFilter.value };
  }

  const items = await db.analyticsUniqueVisitor.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      portalUser: { select: { email: true } },
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
  const totalItems = await db.analyticsUniqueVisitor.count({
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
        title={t("analytics.uniqueVisitors")}
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
                    {i.portalUser ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            if (searchParams.get("portalUserId") || !i.portalUserId) {
                              searchParams.delete("portalUserId");
                            } else {
                              searchParams.set("portalUserId", i.portalUserId);
                            }
                            setSearchParams(searchParams);
                          }}
                          className="underline"
                        >
                          <div className="text-xs text-gray-800">{i.portalUser.email}</div>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (searchParams.get("cookie")) {
                            searchParams.delete("cookie");
                          } else {
                            searchParams.set("cookie", i.cookie);
                          }
                          setSearchParams(searchParams);
                        }}
                        className="underline"
                      >
                        <div className="text-xs text-gray-500">
                          <span className="">Anon</span>: {i.cookie.substring(0, 5) + "..."}
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
      </EditPageLayout>
    </>
  );
}
