import { Prisma } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { DefaultEntityTypes } from "~/application/dtos/shared/DefaultEntityTypes";
import InputSelector from "~/components/ui/input/InputSelector";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import DateUtils from "~/utils/shared/DateUtils";

enum FilterType {
  Last30Days = "last-30-days",
  Last7Days = "last-7-days",
}
const defaultFilter = FilterType.Last30Days;

type EntityCountDto = {
  entity: EntityWithDetails;
  href?: string;
  count: number;
};
type LoaderData = {
  summary: EntityCountDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  let entities: EntityWithDetails[] = [];
  if (tenantId) {
    entities = await getAllEntities({ tenantId, active: true, types: [DefaultEntityTypes.All, DefaultEntityTypes.AdminOnly] });
  } else {
    entities = await getAllEntities({ tenantId, active: true, types: [DefaultEntityTypes.All, DefaultEntityTypes.AppOnly] });
  }
  const userInfo = await getUserInfo(request);

  const rowWhere: Prisma.RowWhereInput = {};
  const searchParams = new URL(request.url).searchParams;
  const countFilter = searchParams.get("count") ?? defaultFilter;
  if (countFilter) {
    if (countFilter === "last-30-days") {
      rowWhere.createdAt = {
        gte: DateUtils.daysFromDate(new Date(), 30 * -1),
      };
    } else if (countFilter === "last-7-days") {
      rowWhere.createdAt = {
        gte: DateUtils.daysFromDate(new Date(), 7 * -1),
      };
    }
  }
  const summary: EntityCountDto[] = await Promise.all(
    entities.map(async (entity) => {
      return {
        entity,
        href: EntityHelper.getRoutes({ routes: EntitiesApi.getNoCodeRoutes({ request, params }), entity })?.list,
        count: await RowsApi.count({
          entity,
          tenantId,
          userId: userInfo.userId,
          rowWhere,
        }),
      };
    })
  );
  const data: LoaderData = {
    summary,
  };
  return json(data);
};

export default () => {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <div className="space-y-5 p-8">
      <div className="flex items-center justify-between space-x-2">
        <h3 className="flex-grow text-lg font-medium leading-6 text-gray-900">Summary</h3>
        <div>
          <InputSelector
            className="w-44"
            withSearch={false}
            name="count"
            value={searchParams.get("count")?.toString() ?? defaultFilter}
            options={[
              { name: t("app.shared.periods.LAST_30_DAYS"), value: FilterType.Last30Days },
              { name: t("app.shared.periods.LAST_7_DAYS"), value: FilterType.Last7Days },
            ]}
            setValue={(value) => {
              if (value) {
                searchParams.set("count", value?.toString() ?? "");
              } else {
                searchParams.delete("count");
              }
              setSearchParams(searchParams);
            }}
          />
        </div>
      </div>
      <dl
        className={clsx(
          "grid grid-cols-1 gap-5",
          data.summary.length === 2 && "sm:grid-cols-2",
          data.summary.length === 3 && "sm:grid-cols-3",
          data.summary.length === 4 && "sm:grid-cols-4",
          data.summary.length === 5 && "sm:grid-cols-3",
          data.summary.length === 6 && "sm:grid-cols-3"
        )}
      >
        {data.summary.map((item, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{t(item.entity.titlePlural)}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        <span>{navigation.state === "loading" ? "..." : item.count}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {item.href && (
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href={item.href} className="text-theme-700 hover:text-theme-900 font-medium">
                    View all
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
};
