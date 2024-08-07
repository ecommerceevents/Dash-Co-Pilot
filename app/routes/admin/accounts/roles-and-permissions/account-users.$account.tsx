import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useParams, useSubmit } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { RoleWithPermissions, getAllRoles, getRole } from "~/utils/db/permissions/roles.db.server";
import { adminGetAllTenantUsers, adminGetAllUsers, getUser, UserWithRoles } from "~/utils/db/users.db.server";
import UserRolesTable from "~/components/core/roles/UserRolesTable";
import { Tenant } from "@prisma/client";
import { useEffect, useState } from "react";
import InputSearch from "~/components/ui/input/InputSearch";
import { createUserRole, deleteUserRole } from "~/utils/db/permissions/userRoles.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { createAdminLog } from "~/utils/db/logs.db.server";
import BreadcrumbSimple from "~/components/ui/breadcrumbs/BreadcrumbSimple";
import { useAdminData } from "~/utils/data/useAdminData";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  tenant: Tenant;
  items: UserWithRoles[];
  roles: RoleWithPermissions[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);

  const tenant = await getTenant(params.account!);
  if (!tenant) {
    return redirect("/admin/accounts/roles-and-permissions/account-users");
  }

  const adminUsers = (await adminGetAllUsers()).items.filter((f) => f.admin);
  const tenantUsers = await adminGetAllTenantUsers(params.account ?? "");
  const roles = await getAllRoles("app");

  const items: UserWithRoles[] = [];
  adminUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });
  tenantUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });

  const data: LoaderData = {
    title: `${t("models.role.adminRoles")} | ${process.env.APP_NAME}`,
    items,
    roles,
    tenant,
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
  if (action === "edit") {
    const userId = form.get("user-id")?.toString() ?? "";
    const roleId = form.get("role-id")?.toString() ?? "";
    const add = form.get("add") === "true";

    const tenant = await getTenant(params.account ?? "");
    const user = await getUser(userId);
    const role = await getRole(roleId);

    if (add) {
      await createUserRole(userId, roleId, params.account);
      createAdminLog(request, "Created", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    } else {
      await deleteUserRole(userId, roleId, params.account);
      createAdminLog(request, "Deleted", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    }

    return json({});
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminAccountUsersFromTenant() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const adminData = useAdminData();
  const [items, setItems] = useState(data.items);
  const submit = useSubmit();
  const params = useParams();

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setItems(data.items);
  }, [actionData, data]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.roles.find(
          (f) => f.role.name.toUpperCase().includes(searchInput.toUpperCase()) || f.role.description.toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  function onChange(item: UserWithRoles, role: RoleWithPermissions, add: any) {
    const form = new FormData();
    form.set("action", "edit");
    form.set("user-id", item.id);
    form.set("role-id", role.id);
    form.set("add", add ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="space-y-2">
      <BreadcrumbSimple
        home="/admin"
        menu={[
          {
            title: "App Users",
            routePath: "/admin/accounts/roles-and-permissions/account-users",
          },
          {
            title: data.tenant.name,
            routePath: "/admin/accounts/roles-and-permissions/account-users/" + data.tenant.id,
          },
        ]}
      />
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <UserRolesTable
        items={filteredItems()}
        roles={data.roles}
        onChange={onChange}
        tenantId={params.account ?? ""}
        disabled={!getUserHasPermission(adminData, "admin.roles.set")}
      />
    </div>
  );
}
