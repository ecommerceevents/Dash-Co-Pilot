import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { LinkedAccountForm } from "~/components/core/linkedAccounts/LinkedAccountForm";
import { getTranslations } from "~/locale/i18next.server";
import { TenantTypesApi } from "~/utils/api/.server/TenantTypesApi";
import { TenantsApi } from "~/utils/api/.server/TenantsApi";
import UrlUtils from "~/utils/app/UrlUtils";
import { EntityWithDetails, findEntityByName } from "~/utils/db/entities/entities.db.server";
import { getAllRoles } from "~/utils/db/permissions/roles.db.server";
import { createTenantUser } from "~/utils/db/tenants.db.server";
import { createTenantRelationship } from "~/utils/db/tenants/tenantRelationships.db.server";
import { TenantTypeRelationshipWithDetails, getTenantTypeRelationshipById } from "~/utils/db/tenants/tenantTypeRelationships.db.server";
import { getUser, getUserByEmail, register } from "~/utils/db/users.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getExistingSlug } from "~/utils/services/tenantService";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  relationship: TenantTypeRelationshipWithDetails;
  tenantSettingsEntity: EntityWithDetails | null;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.accounts.create", tenantId);
  const relationship = await getTenantTypeRelationshipById(params.relationship!);
  if (!relationship) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings/accounts"));
  }
  const tenantSettingsEntity = await findEntityByName({ tenantId, name: "tenantSettings" });
  const data: LoaderData = {
    relationship,
    tenantSettingsEntity,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);
  const currentUser = await getUser(userInfo.userId);
  if (!currentUser) {
    return json({ error: t("shared.notFound") }, { status: 400 });
  }

  const relationship = await getTenantTypeRelationshipById(params.relationship!);
  if (!relationship) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings/accounts"));
  }

  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "create") {
    try {
      const name = form.get("company")?.toString() ?? "";
      const slug = form.get("slug")?.toString() ?? "";
      const existingSlug = await getExistingSlug(slug);
      if (!slug || existingSlug) {
        return json({ error: t("shared.slugTaken") }, { status: 400 });
      }
      const users: { email: string; password: string; passwordConfirmation: string; firstName: string; lastName: string }[] = form
        .getAll("users[]")
        .map((f) => JSON.parse(f.toString()));
      const addMySelf = Boolean(form.get("addMySelf"));
      if (addMySelf && users.find((f) => f.email === currentUser.email)) {
        return json({ error: "You added yourself twice" }, { status: 400 });
      }

      await Promise.all(
        users.map(async (toAdd) => {
          let existing = await getUserByEmail(toAdd.email);
          if (existing) {
            return;
          }
          if (!toAdd.password) {
            throw Error("Password required for new user: " + toAdd.email);
          }
          const createdUser = await register({
            email: toAdd.email,
            password: toAdd.password,
            firstName: toAdd.firstName,
            lastName: toAdd.lastName,
            request,
          });
          if (!createdUser) {
            throw Error("Could not create user");
          }
        })
      );

      const { tenant, user } = await TenantsApi.create({ request, form, name, slug });
      const roles = await getAllRoles("app");
      await Promise.all(
        users.map(async (toAdd) => {
          let existing = await getUserByEmail(toAdd.email);
          if (!existing) {
            throw Error("Could not find user with email: " + toAdd.email);
          }
          return await createTenantUser(
            {
              tenantId: tenant.id,
              userId: existing.id,
              type: TenantUserType.OWNER,
            },
            roles
          );
        })
      );
      if (addMySelf) {
        await createTenantUser(
          {
            tenantId: tenant.id,
            userId: user.id,
            type: TenantUserType.OWNER,
          },
          roles
        );
      }
      await createTenantRelationship({
        fromTenantId: tenantId,
        toTenantId: tenant.id,
        tenantTypeRelationshipId: relationship.id,
        createdByUserId: userInfo.userId,
      });
      if (relationship.toType) {
        await TenantTypesApi.setTenantTypes({
          tenantId: tenant.id,
          types: [relationship.toType.id],
        });
      }
      return redirect(UrlUtils.currentTenantUrl(params, "settings/accounts"));
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div>
      <LinkedAccountForm relationship={data.relationship} tenantSettingsEntity={data.tenantSettingsEntity} />
    </div>
  );
}
