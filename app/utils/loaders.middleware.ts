import { redirect } from "@remix-run/node";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { getTenantMember } from "./db/tenants.db.server";
import { getUser } from "./db/users.db.server";
import { getTenantIdFromUrl } from "./services/.server/urlService";
import { getUserInfo } from "./session.server";
import { Params } from "react-router";

export async function requireAdminUser(request: Request) {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user?.admin) {
    throw redirect("/401");
  }
}

export async function requireOwnerOrAdminRole(request: Request, params: Params) {
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user?.admin) {
    const tenantMember = await getTenantMember(userInfo.userId, tenantId);
    if (!tenantMember || (tenantMember.type !== TenantUserType.OWNER && tenantMember.type !== TenantUserType.ADMIN)) {
      throw redirect("/401");
    }
  }
}
