import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { createUserSession, getUserInfo } from "~/utils/session.server";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import RowOverviewRoute from "~/modules/rows/components/RowOverviewRoute";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { getBaseURL } from "~/utils/url.server";
import ServerError from "~/components/ui/errors/ServerError";
import { useTypedLoaderData } from "remix-typedjson";

type LoaderData = {
  title: string;
  error?: string;
  publicRowData?: {
    rowData: RowsApi.GetRowData;
    routes: EntitiesApi.Routes;
    relationshipRows: RowsApi.GetRelationshipRowsData;
  };
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  if (userInfo.lightOrDarkMode === "dark") {
    return createUserSession(
      {
        ...userInfo,
        lightOrDarkMode: "light",
      },
      new URL(request.url).pathname
    );
  }

  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity!, activeOnly: true });
  const userId = (await getUserInfo(request)).userId;
  if (!entity.isAutogenerated || entity.type === "system") {
    return redirect("/404?entity=" + params.entity);
  }
  try {
    const rowData = await RowsApi.get(params.id!, {
      entity,
      userId,
    });
    if (!rowData.rowPermissions.canRead) {
      throw Error(t(entity.title) + " is not public");
    }
    const data: LoaderData = {
      title: `${RowHelper.getTextDescription({ entity, item: rowData.item, t })} | ${process.env.APP_NAME}`,
      publicRowData: {
        rowData,
        routes: {
          publicUrl: getBaseURL(request) + `/public/:entity/:id`,
        },
        relationshipRows: await RowsApi.getRelationshipRows({ entity, tenantId: rowData.item.tenantId, userId }),
      },
    };
    return json({ ...data });
  } catch (e: any) {
    return json({ title: "", error: e.message }, { status: 500 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function PublicRowItemRoute() {
  const { publicRowData, error } = useTypedLoaderData<LoaderData>();
  const { t } = useTranslation();
  return (
    <>
      <div>
        <div>
          <HeaderBlock />
          <div className="bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="sm:align-center sm:flex sm:flex-col">
                <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-2 py-12 sm:py-6">
                  {!publicRowData ? (
                    <>
                      <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("shared.unauthorized")}</h1>
                        <p className="text-muted-foreground mt-4 text-lg leading-6">{error}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(publicRowData.rowData.entity.title)}</h1>
                        <p className="text-muted-foreground mt-4 text-lg leading-6">
                          {publicRowData.rowData.item?.tenant ? (
                            <div>
                              {publicRowData.rowData.item?.tenant?.name}, {RowHelper.getRowFolio(publicRowData.rowData.entity, publicRowData.rowData.item)}
                            </div>
                          ) : (
                            <div>{RowHelper.getRowFolio(publicRowData.rowData.entity, publicRowData.rowData.item)}</div>
                          )}
                        </p>
                      </div>
                      <div className="mt-12">
                        <div className="space-y-3 border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                          <RowOverviewRoute
                            rowData={publicRowData.rowData}
                            item={publicRowData.rowData.item}
                            routes={publicRowData.routes}
                            relationshipRows={publicRowData.relationshipRows}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}