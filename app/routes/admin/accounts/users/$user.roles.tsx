import { Role } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import { db } from "~/utils/db.server";
import { RoleWithPermissions, getAllRoles, getRoles } from "~/utils/db/permissions/roles.db.server";
import { UserWithDetails, getUserByEmail, getUserByEmailWithDetails } from "~/utils/db/users.db.server";
import { setUserRoles } from "~/utils/services/userService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  user: UserWithDetails;
  adminRoles: RoleWithPermissions[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await getUserByEmailWithDetails(params.user!);
  if (!user) {
    return redirect("/admin/accounts/users");
  }
  const data: LoaderData = {
    user,
    adminRoles: await getAllRoles("admin"),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userInfo = await getUserInfo(request);
  // const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  const user = await getUserByEmail(params.user);

  if (!user) {
    return redirect("/admin/accounts/users");
  }

  if (action === "set-user-roles") {
    const arrRoles: { id: string; tenantId: string | undefined }[] = form.getAll("roles[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    const allRoles = await getRoles(arrRoles.map((r) => r.id));
    let setRoles: { role: Role; tenantId: string | null }[] = [];
    arrRoles.forEach(({ id, tenantId }) => {
      const role = allRoles.find((r) => r.id === id);
      if (!role) {
        throw new Error("Role not found with ID: " + id);
      }
      setRoles.push({ role, tenantId: tenantId ?? null });
    });
    setRoles = setRoles.filter((v, i, a) => a.findIndex((t) => t.role.id === v.role.id) === i);

    const isAdmin = setRoles.some((r) => r.role.type === "admin");
    // eslint-disable-next-line no-console
    console.log(
      "setting roles for user",
      JSON.stringify({
        user: user.email,
        roles: setRoles.map((f) => f.role.name),
        isAdmin,
      })
    );

    const countAdmins = await db.adminUser.count();
    if (!isAdmin && countAdmins === 1) {
      return json({ error: "You cannot remove admin access from the last admin user" }, { status: 400 });
    }
    const hasSuperAdmin = setRoles.some((r) => r.role.name === DefaultAdminRoles.SuperAdmin);
    if (user.id === userInfo.userId && !hasSuperAdmin) {
      return json({ error: "You cannot remove super admin access from yourself" }, { status: 400 });
    }

    await setUserRoles({ user, roles: setRoles, isAdmin, type: "admin" });

    return redirect("/admin/accounts/users");
    // return json({ success: t("shared.updated") });
  } else {
    return json({ error: "Form not submitted correctly." }, { status: 400 });
  }
};

export default function SetUserRolesRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();

  const { t } = useTranslation();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [selectedRoles, setSelectedRoles] = useState<string[]>(data.user.roles?.filter((f) => f.role.type === "admin").map((r) => r.role.id));

  function hasSomeAdminRoles() {
    return data.adminRoles.some((ar) => selectedRoles?.includes(ar.id));
  }
  function hasAllAdminRoles() {
    return data.adminRoles.every((ar) => selectedRoles?.includes(ar.id));
  }

  return (
    <div>
      <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value="set-user-roles" hidden readOnly />
        {selectedRoles?.map((role, idx) => {
          return (
            <input
              key={idx}
              type="hidden"
              name="roles[]"
              value={JSON.stringify({
                id: role,
                tenantId: undefined,
              })}
            />
          );
        })}

        <div className="flex items-center justify-between space-x-2 border-b border-gray-200 pb-2">
          <div className="text-lg font-medium text-gray-700">{t("models.role.plural")}</div>
          <div className="flex items-center space-x-2">
            <ButtonSecondary disabled={!hasSomeAdminRoles()} onClick={() => setSelectedRoles([])}>
              {t("shared.clear")}
            </ButtonSecondary>

            <ButtonSecondary disabled={hasAllAdminRoles()} onClick={() => setSelectedRoles(data.adminRoles.map((r) => r.id))}>
              {t("shared.selectAll")}
            </ButtonSecondary>
          </div>
        </div>
        <div className="relative mt-1 rounded-md shadow-sm">
          {data.adminRoles?.map((role, idx) => (
            <InputCheckboxWithDescription
              key={idx}
              name={role.name}
              title={role.name}
              description={role.description}
              value={selectedRoles.includes(role.id)}
              setValue={(e) => {
                if (e) {
                  setSelectedRoles((f) => [...f, role.id]);
                } else {
                  setSelectedRoles((f) => f.filter((f) => f !== role.id));
                }
              }}
            />
          ))}
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <ButtonSecondary type="button" className="w-full" onClick={() => navigate("/admin/accounts/users")}>
            <div className="w-full text-center">{t("shared.back")}</div>
          </ButtonSecondary>
          <LoadingButton type="submit" disabled={navigation.state === "submitting"} className="w-full">
            {t("shared.save")}
          </LoadingButton>
        </div>
      </Form>
      <ActionResultModal actionData={actionData ?? undefined} />
    </div>
  );
}
