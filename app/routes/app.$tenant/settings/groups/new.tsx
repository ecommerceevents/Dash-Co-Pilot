import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import GroupForm from "~/components/core/roles/GroupForm";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { createLog } from "~/utils/db/logs.db.server";
import { createGroup } from "~/utils/db/permissions/groups.db.server";
import { createUserGroup } from "~/utils/db/permissions/userGroups.db.server";
import { getTenantUsers, TenantUserWithUser } from "~/utils/db/tenants.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  tenantUsers: TenantUserWithUser[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  const data: LoaderData = {
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
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const data = {
      createdByUserId: userInfo.userId,
      tenantId: tenantId,
      name: form.get("name")?.toString() ?? "",
      description: form.get("description")?.toString() ?? "",
      color: Number(form.get("color")),
    };
    const group = await createGroup(data);
    const userIds = form.getAll("users[]").map((f) => f.toString());
    const users = await getUsersById(userIds);
    await Promise.all(
      users.map(async (user) => {
        return await createUserGroup(user.id, group.id);
      })
    );
    createLog(
      request,
      tenantId,
      "Created",
      `${JSON.stringify({
        ...data,
        users: users.map((f) => f.email),
      })}`
    );
    return redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function NewGroupRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const data = useTypedLoaderData<LoaderData>();

  return (
    <SlideOverWideEmpty
      title="Create User Group"
      open={true}
      className="sm:max-w-sm"
      onClose={() => navigate(UrlUtils.currentTenantUrl(params, "settings/members"))}
    >
      <GroupForm allUsers={data.tenantUsers} />
    </SlideOverWideEmpty>
  );
}
