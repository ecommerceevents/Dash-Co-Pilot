import { Tenant, TenantUser } from "@prisma/client";
import { json } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { getTenantWithUsers } from "../db/tenants.db.server";

export type AdminTenantLoaderData = {
  title: string;
  tenant: (Tenant & { users: TenantUser[] }) | null;
};

export function useAdminTenantData(id?: string): AdminTenantLoaderData {
  return (useMatches().find((f) => f.pathname === "/admin/tenant/" + id)?.data ?? {}) as AdminTenantLoaderData;
}

export async function loadAdminTenantData(request: Request, id?: string) {
  const { t } = await getTranslations(request);
  const tenant = await getTenantWithUsers(id);
  const data: AdminTenantLoaderData = {
    title: `${t("models.tenant.object")} | ${process.env.APP_NAME}`,
    tenant,
  };
  return json(data);
}
