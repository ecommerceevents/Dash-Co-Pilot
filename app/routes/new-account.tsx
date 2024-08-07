import { Link, useActionData, useNavigate, useNavigation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import TenantNew from "~/components/core/settings/tenant/TenantNew";
import { getAllRoles } from "~/utils/db/permissions/roles.db.server";
import { createTenantUser, getMyTenants, TenantSimple } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { useTypedLoaderData } from "remix-typedjson";
import { EntityWithDetails, findEntityByName } from "~/utils/db/entities/entities.db.server";
import { TenantsApi } from "~/utils/api/.server/TenantsApi";
import Logo from "~/components/brand/Logo";

type LoaderData = {
  myTenants: TenantSimple[];
  tenantSettingsEntity: EntityWithDetails | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user) {
    throw redirect(`/login`);
  }
  const myTenants = await getMyTenants(userInfo.userId);
  const tenantSettingsEntity = await findEntityByName({ tenantId: null, name: "tenantSettings" });
  const data: LoaderData = {
    myTenants,
    tenantSettingsEntity,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
export const action: ActionFunction = async ({ request }) => {
  try {
    const form = await request.formData();
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString();
    const { tenant, user } = await TenantsApi.create({ request, form, name, slug });
    const roles = await getAllRoles("app");
    await createTenantUser(
      {
        tenantId: tenant.id,
        userId: user.id,
        type: TenantUserType.OWNER,
      },
      roles
    );
    return redirect(`/app/${tenant.slug}/dashboard`);
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};

export default function AppNewAccountRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation()
  return (
    <div className="h-screen overflow-auto py-20">
      <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
        <div className="flex flex-shrink-0 justify-center">
          <Link to="/" className="inline-flex">
            <Logo />
          </Link>
        </div>
        <div className="sm:align-center sm:flex sm:flex-col">
          <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("app.tenants.create.title")}</h1>
              <p className="text-muted-foreground mt-4 text-lg leading-6">{t("app.tenants.create.headline")}</p>
            </div>
            <div className="mt-12">
              <TenantNew tenantSettingsEntity={data.tenantSettingsEntity} />
              <div id="form-error-message">
                {actionData?.error && navigation.state === "idle" ? (
                  <p className="py-2 text-xs text-rose-500" role="alert">
                    {actionData.error}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex">
                <button type="button" onClick={() => navigate(-1)} className="text-primary hover:text-primary/90 w-full text-center text-sm font-medium">
                  <span aria-hidden="true"> &larr;</span> Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
