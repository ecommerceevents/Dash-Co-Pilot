import { Tenant } from "@prisma/client";
import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import ApiKeyCreatedModal from "~/components/core/apiKeys/ApiKeyCreatedModal";
import ApiKeyForm from "~/components/core/apiKeys/ApiKeyForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { createApiKey, getApiKeyByAlias } from "~/utils/db/apiKeys.db.server";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getApiKeyEntityPermissions } from "~/utils/helpers/.server/ApiKeyHelperService";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import EventsService from "~/modules/events/services/.server/EventsService";
import { getUserInfo } from "~/utils/session.server";
import { ApiKeyCreatedDto } from "~/modules/events/dtos/ApiKeyCreatedDto";

type LoaderData = {
  tenants: Tenant[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.apiKeys.create");
  const tenants = await adminGetAllTenants();
  const data: LoaderData = {
    tenants,
  };
  return json(data);
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
  const userInfo = await getUserInfo(request);
  const currentUser = await getUser(userInfo.userId);

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
    const tenantId = form.get("tenant-id")?.toString() ?? "";
    const alias = form.get("alias")?.toString() ?? "";
    const existingAlias = await getApiKeyByAlias(tenantId, alias);
    if (existingAlias) {
      return badRequest({ error: "API key with this alias already exists: " + alias });
    }
    const active = Boolean(form.get("active"));
    const apiKey = await createApiKey(
      {
        tenantId,
        createdByUserId: userInfo.userId,
        alias,
        expires: expirationDate,
        active,
      },
      entities
    );
    await createAdminLog(request, "API Key Created", JSON.stringify({ id: apiKey.id, tenantId, alias, expirationDate, active, entities }));
    await EventsService.create({
      request,
      event: "api_key.created",
      tenantId,
      userId: currentUser?.id ?? "",
      data: {
        id: apiKey.id,
        alias: apiKey.alias,
        expires: expirationDate,
        active: active,
        entities: await getApiKeyEntityPermissions(entities),
        user: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
      } satisfies ApiKeyCreatedDto,
    });
    // return success({ apiKey });
    return redirect("/admin/api/keys");
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function AdminApiNewKeyRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const adminData = useAdminData();
  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => navigate(`/admin/api/keys`)}>
        <ApiKeyForm entities={adminData.entities} tenants={data.tenants} />
        {actionData?.apiKey !== undefined && <ApiKeyCreatedModal apiKey={actionData?.apiKey} redirectTo="/admin/api/keys" />}
      </OpenModal>
    </>
  );
}
