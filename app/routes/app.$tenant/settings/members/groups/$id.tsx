import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import GroupForm from "~/components/core/roles/GroupForm";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { createLog } from "~/utils/db/logs.db.server";
import { deleteGroup, getGroup, GroupWithDetails, updateGroup } from "~/utils/db/permissions/groups.db.server";
import { createUserGroup, deleteGroupUsers } from "~/utils/db/permissions/userGroups.db.server";
import { getTenantUsers, TenantUserWithUser } from "~/utils/db/tenants.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";

type LoaderData = {
  title: string;
  item: GroupWithDetails;
  tenantUsers: TenantUserWithUser[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);

  const item = await getGroup(params.id ?? "");
  if (!item) {
    throw redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  }
  const data: LoaderData = {
    title: `${item.name} | ${t("models.group.object")} | ${process.env.APP_NAME}`,
    item,
    tenantUsers: await getTenantUsers(tenantId),
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);

  const existing = await getGroup(params.id ?? "");
  if (!existing) {
    throw redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const data = {
      tenantId: tenantId,
      name: form.get("name")?.toString() ?? "",
      description: form.get("description")?.toString() ?? "",
      color: Number(form.get("color")),
    };
    await updateGroup(existing.id, data);
    await deleteGroupUsers(existing.id);
    const userIds = form.getAll("users[]").map((f) => f.toString());
    const users = await getUsersById(userIds);
    await Promise.all(
      users.map(async (user) => {
        return await createUserGroup(user.id, existing.id);
      })
    );
    createLog(request, tenantId, "Updated", `${existing.name}: ${JSON.stringify({ ...data, users: users.map((f) => f.email) })}`);
  } else if (action === "delete") {
    await deleteGroup(existing.id);
    createLog(request, tenantId, "Deleted", `${existing.name}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminEditGroupRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const appData = useAppData();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <SlideOverWideEmpty
      title="Edit User Group"
      open={true}
      className="sm:max-w-sm"
      onClose={() => navigate(UrlUtils.currentTenantUrl(params, "settings/members"))}
    >
      <GroupForm
        allUsers={data.tenantUsers}
        item={data.item}
        canUpdate={getUserHasPermission(appData, "app.settings.groups.full") || data.item.createdByUserId === appData.user.id}
        canDelete={getUserHasPermission(appData, "app.settings.groups.full") || data.item.createdByUserId === appData.user.id}
      />
    </SlideOverWideEmpty>
  );
}
