import { redirect } from "@remix-run/node";
import { db } from "../../db.server";
import { Params } from "react-router";
import UrlUtils from "../../app/UrlUtils";
import { cachified } from "../../cache.server";

export async function getTenantIdFromUrl(params: Params) {
  const { tenant } = params;
  let tenantId = "";
  const tenantFromParams = await cachified({
    key: `tenantIdOrSlug:${tenant}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => getTenantByIdOrSlug(tenant),
  });
  if (tenantFromParams) {
    tenantId = tenantFromParams;
    if (!tenantId) {
      // eslint-disable-next-line no-console
      console.log("[urlService] Redirecting to /app");
      throw redirect("/app");
    }
  }
  return tenantId;
}

export async function getTenantIdOrNull({ request, params }: { request: Request; params: Params }) {
  const { tenant } = params;
  const currentPath = new URL(request.url).pathname;
  if (currentPath.startsWith("/admin")) {
    return null;
  } else if (currentPath.startsWith("/app") && UrlUtils.stripTrailingSlash(currentPath) !== "/app") {
    if (!tenant) {
      // eslint-disable-next-line no-console
      console.log("[urlService] getTenantIdOrNull(): Redirecting to /app");
      throw redirect("/app");
    }
    const tenantFromParams = await getTenantByIdOrSlug(tenant);
    if (!tenantFromParams) {
      // eslint-disable-next-line no-console
      console.log("[urlService] getTenantIdOrNull(): Redirecting to /app");
      throw redirect("/app");
    }
    return tenantFromParams;
  }
  return null;
}

export async function getTenantByIdOrSlug(tenant: string | undefined) {
  return (
    (
      await db.tenant.findFirst({
        where: { OR: [{ slug: tenant }, { id: tenant }] },
        select: { id: true },
      })
    )?.id ?? ""
  );
}
