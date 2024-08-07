import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useActionData, useNavigate, useParams } from "@remix-run/react";
import ApiKeyCreatedModal from "~/components/core/apiKeys/ApiKeyCreatedModal";
import ApiKeyForm from "~/components/core/apiKeys/ApiKeyForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { createApiKey, getApiKeyByAlias } from "~/utils/db/apiKeys.db.server";
import { createLog } from "~/utils/db/logs.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getApiKeyEntityPermissions } from "~/utils/helpers/.server/ApiKeyHelperService";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import EventsService from "~/modules/events/services/.server/EventsService";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { ApiKeyCreatedDto } from "~/modules/events/dtos/ApiKeyCreatedDto";
import { getTenant } from "~/utils/db/tenants.db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.apiKeys.create", tenantId);
  return json({});
};

type ActionData = {
  error?: string;
  apiKey?: {
    key: string;
    alias: string;
  };
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);
  const tenant = await getTenant(tenantId);
  const currentUser = await getUser(userInfo.userId);

  if (!tenant || !currentUser) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const entities: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = form
      .getAll("entities[]")
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });

    let expirationDate: Date | null = null;
    let expires = form.get("expires")?.toString();
    if (expires) {
      expirationDate = new Date(expires);
    }
    const alias = form.get("alias")?.toString() ?? "";
    const existingAlias = await getApiKeyByAlias(tenantId, alias);
    if (existingAlias) {
      return badRequest({ error: "API key with this alias already exists: " + alias });
    }
    const active = Boolean(form.get("active"));
    const apiKey = await createApiKey(
      {
        tenantId: tenantId,
        createdByUserId: userInfo.userId,
        alias,
        expires: expirationDate,
        active,
      },
      entities
    );
    await EventsService.create({
      request,
      event: "api_key.created",
      tenantId: tenantId,
      userId: currentUser.id,
      data: {
        id: apiKey.id,
        alias: apiKey.alias,
        expires: expirationDate,
        active: active,
        entities: await getApiKeyEntityPermissions(entities),
        user: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
      } satisfies ApiKeyCreatedDto,
    });
    await createLog(request, tenantId, "API Key Created", JSON.stringify({ id: apiKey.id, alias, expirationDate, active, entities }));
    return redirect(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
    // return success({ apiKey });
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function ApiNewKeyRoute() {
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const params = useParams();
  const appData = useAppData();
  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => navigate(UrlUtils.currentTenantUrl(params, "settings/api/keys"))}>
        <ApiKeyForm entities={appData.entities} />
        {actionData?.apiKey !== undefined && (
          <ApiKeyCreatedModal apiKey={actionData?.apiKey} redirectTo={UrlUtils.currentTenantUrl(params, "settings/api/keys")} />
        )}
      </OpenModal>
    </>
  );
}
