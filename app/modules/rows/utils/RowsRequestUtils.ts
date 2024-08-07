import type { TFunction } from "i18next";
import { getTranslations } from "~/locale/i18next.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { promiseHash } from "~/utils/promises/promiseHash";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { Params } from "@remix-run/router";

type RowsLoaderData = {
  t: TFunction;
  userId: string;
  tenantId: string | null;
  entity: EntityWithDetails;
};
async function getLoader({ request, params }: { request: Request; params: Params }): Promise<RowsLoaderData> {
  const tenantId = await getTenantIdOrNull({ request, params });
  const unparsedData = await promiseHash({
    i18n: getTranslations(request),
    userInfo: getUserInfo(request),
    tenantId: getTenantIdOrNull({ request, params }),
    entity: getEntityBySlug({ tenantId, slug: params.entity!, activeOnly: true }),
  });

  const data: RowsLoaderData = {
    t: unparsedData.i18n.t,
    userId: unparsedData.userInfo.userId,
    tenantId: unparsedData.tenantId,
    entity: unparsedData.entity,
  };
  return data;
}

type RowsActionData = RowsLoaderData & {
  form: FormData;
};
async function getAction({ request, params }: { request: Request; params: Params }): Promise<RowsActionData> {
  const data = await promiseHash({
    loader: getLoader({ request, params }),
    form: request.formData(),
  });

  return {
    ...data.loader,
    form: data.form,
  };
}

export default {
  getLoader,
  getAction,
};
