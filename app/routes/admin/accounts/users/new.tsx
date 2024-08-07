import { Role } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputText from "~/components/ui/input/InputText";
import { getTranslations } from "~/locale/i18next.server";
import { RoleWithPermissions, getAllRoles, getRoles } from "~/utils/db/permissions/roles.db.server";
import { getUser, getUserByEmail, register } from "~/utils/db/users.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { setUserRoles } from "~/utils/services/userService";

type LoaderData = {
  adminRoles: RoleWithPermissions[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    adminRoles: await getAllRoles("admin"),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.account.users");
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "new-user") {
    const email = form.get("email")?.toString();
    const firstName = form.get("firstName")?.toString();
    const lastName = form.get("lastName")?.toString();
    const password = form.get("password")?.toString();

    const arrRoles: { id: string; tenantId: string | undefined }[] = form.getAll("roles[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (!email || !password || !firstName) {
      return json({ error: "Missing required fields." }, { status: 400 });
    }
    // if (arrRoles.length === 0) {
    //   return json({ error: "You must select at least one role." }, { status: 400 });
    // }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return json({ error: "User already exists with that email." }, { status: 400 });
    }

    const allRoles = await getRoles(arrRoles.map((r) => r.id));
    const setRoles: { role: Role; tenantId: string | null }[] = [];
    arrRoles.forEach(({ id, tenantId }) => {
      const role = allRoles.find((r) => r.id === id);
      if (!role) {
        throw new Error("Role not found with ID: " + id);
      }
      setRoles.push({ role, tenantId: tenantId ?? null });
    });

    const isAdmin = setRoles.some((r) => r.role.type === "admin");

    const { id } = await register({
      email,
      firstName,
      lastName: lastName ?? "",
      password,
      request,
    });
    const user = await getUser(id);
    if (!user) {
      return json({ error: "Unexpected error while creating user." }, { status: 400 });
    }

    await setUserRoles({ user, roles: setRoles, isAdmin, type: "admin" });

    return redirect("/admin/accounts/users");
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function SetUserRolesRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();

  const { t } = useTranslation();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div>
      <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value="new-user" hidden readOnly />
        {selectedRoles?.map((role) => {
          return (
            <input
              key={role}
              type="hidden"
              name="roles[]"
              value={JSON.stringify({
                id: role,
                tenantId: undefined,
              })}
            />
          );
        })}

        <div className="space-y-2">
          <InputText autoFocus type="email" name="email" title={t("models.user.email")} value={email} setValue={setEmail} required />

          <InputText type="password" name="password" title={t("account.shared.password")} value={password} setValue={setPassword} required />

          <InputText name="firstName" title={t("models.user.firstName")} value={firstName} setValue={setFirstName} required />

          <InputText name="lastName" title={t("models.user.lastName")} value={lastName} setValue={setLastName} />

          <div>
            <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">{t("models.role.plural")}</label>
            <div className="divide-y divide-gray-100 rounded-md border border-gray-300 bg-white px-2 py-1">
              {data.adminRoles?.map((role) => (
                <InputCheckboxWithDescription
                  key={role.name}
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
          </div>
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
    </div>
  );
}
