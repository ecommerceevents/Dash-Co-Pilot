import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import RoleForm from "~/components/core/roles/RoleForm";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import { getTranslations } from "~/locale/i18next.server";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { getAllPermissions, PermissionWithRoles } from "~/utils/db/permissions/permissions.db.server";
import { setRolePermissions } from "~/utils/db/permissions/rolePermissions.db.server";
import { createRole, getNextRolesOrder, getRoleByName } from "~/utils/db/permissions/roles.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  title: string;
  permissions: PermissionWithRoles[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.roles.create");
  const { t } = await getTranslations(request);

  const permissions = await getAllPermissions();
  const data: LoaderData = {
    title: `${t("models.role.object")} | ${process.env.APP_NAME}`,
    permissions,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const assignToNewUsers = Boolean(form.get("assign-to-new-users"));
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const permissions = form.getAll("permissions[]").map((f) => f.toString());

    const existing = await getRoleByName(name);
    if (existing) {
      return badRequest({ error: "Existing role with name: " + name });
    }

    const order = await getNextRolesOrder(type);
    const data = {
      order,
      name,
      description,
      assignToNewUsers,
      type,
      isDefault: false,
    };
    const role = await createRole(data);
    await setRolePermissions(role.id, permissions);
    createAdminLog(
      request,
      "Create",
      `${JSON.stringify({
        ...data,
        permissions,
      })}`
    );
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect("/admin/accounts/roles-and-permissions/roles");
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminNewRoleRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const navigate = useNavigate();
  function goBack() {
    navigate("/admin/accounts/roles-and-permissions/roles");
  }
  return (
    <SlideOverFormLayout title={"New Role"} description="" onClosed={goBack}>
      <RoleForm permissions={data.permissions} onCancel={goBack} />
    </SlideOverFormLayout>
  );
}
