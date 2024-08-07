import { LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { getTranslations } from "~/locale/i18next.server";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import { getEntityGroupBySlug } from "~/utils/db/entities/entityGroups.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import RowsList from "~/components/entities/rows/RowsList";
import { Link, useParams } from "@remix-run/react";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

type LoaderData = {
  title: string;
  entitiesData: { [entity: string]: RowsApi.GetRowsData };
  entitiesRoutes: { [entity: string]: EntitiesApi.Routes };
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const group = await getEntityGroupBySlug(params.group!);
  if (!group) {
    throw redirect(tenantId ? UrlUtils.currentTenantUrl(params, "404") : "/404");
  }
  const urlSearchParams = new URL(request.url).searchParams;
  const allEntities = await getAllEntities({ tenantId });
  const entitiesData: LoaderData["entitiesData"] = {};
  const entitiesRoutes: LoaderData["entitiesRoutes"] = {};
  await Promise.all(
    group.entities.map(async ({ entityId, allView }) => {
      const entity = allEntities.find((f) => f.id === entityId);
      if (!entity) {
        return;
      }
      const data = await RowsApi.getAll({
        entity,
        tenantId,
        urlSearchParams,
        entityView: allView ?? undefined,
      });
      entitiesData[entity.name] = data;
      entitiesRoutes[entity.name] = EntitiesApi.getNoCodeRoutes({ request, params });
      return entitiesData;
    })
  );
  const data: LoaderData = {
    title: `${t(group.title)} | ${process.env.APP_NAME}`,
    entitiesData,
    entitiesRoutes,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();

  function getGroup() {
    return appOrAdminData.entityGroups.find((f) => f.slug === params.group);
  }

  return (
    <IndexPageLayout>
      <div className="space-y-2">
        {getGroup()?.entities.map(({ entity, allView }) => {
          return (
            <div key={entity.id} className="space-y-1">
              <div className="flex items-center justify-between space-x-2">
                <h3 className="text-sm font-medium">
                  {t(entity.titlePlural)} <span className="text-xs text-gray-500">({data.entitiesData[entity.name].items.length})</span>
                </h3>
                <Link
                  to={entity.slug + "/new"}
                  className="rounded-full bg-gray-50 p-1 text-gray-800 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                </Link>
              </div>
              <RowsList
                view={(allView?.layout ?? "card") as "table" | "board" | "grid" | "card"}
                entity={data.entitiesData[entity.name].entity}
                items={data.entitiesData[entity.name].items}
                routes={data.entitiesRoutes[entity.name]}
                pagination={data.entitiesData[entity.name].pagination}
                currentView={allView}
              />
            </div>
          );
        })}
      </div>
    </IndexPageLayout>
  );
};
