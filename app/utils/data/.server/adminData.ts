import { redirect } from "remix-typedjson";
import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import { DefaultPermission } from "~/application/dtos/shared/DefaultPermissions";
import { TimeFunction } from "~/modules/metrics/services/.server/MetricTracker";
import OnboardingService from "~/modules/onboarding/services/OnboardingService";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import { getAllEntityGroups } from "~/utils/db/entities/entityGroups.db.server";
import { getMyGroups } from "~/utils/db/permissions/groups.db.server";
import { getAllRolesWithoutPermissions } from "~/utils/db/permissions/roles.db.server";
import { getPermissionsByUser, getUserRoleInAdmin } from "~/utils/db/permissions/userRoles.db.server";
import { getMyTenants } from "~/utils/db/tenants.db.server";
import { getAllTenantTypes } from "~/utils/db/tenants/tenantTypes.db.server";
import { promiseHash } from "~/utils/promises/promiseHash";
import { getUserInfo } from "~/utils/session.server";
import { AdminLoaderData } from "../useAdminData";
import { getUser } from "~/utils/db/users.db.server";
import { json } from "@remix-run/node";
import { TFunction } from "i18next";

export async function loadAdminData({ request, t }: { request: Request; t: TFunction }, time: TimeFunction) {
  const userInfo = await time(getUserInfo(request), "getUserInfo");
  const url = new URL(request.url);
  if (UrlUtils.stripTrailingSlash(url.pathname) === `/admin`) {
    throw redirect(`/admin/dashboard`);
  }
  const user = await time(getUser(userInfo?.userId), "getUser");
  const redirectTo = url.pathname + url.search;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  if (!user.admin) {
    throw json({ error: "Only admins can access this page" }, { status: 401 });
  }

  const myTenants = await time(getMyTenants(user.id), "getMyTenants");

  const { allPermissions, superAdminRole, entities, entityGroups, allRoles, myGroups, onboardingSession } = await time(
    promiseHash({
      allPermissions: getPermissionsByUser(userInfo.userId, null),
      superAdminRole: getUserRoleInAdmin(userInfo.userId, DefaultAdminRoles.SuperAdmin),
      entities: getAllEntities({ tenantId: null }),
      entityGroups: getAllEntityGroups(),
      allRoles: getAllRolesWithoutPermissions("admin"),
      myGroups: getMyGroups(user.id, null),
      onboardingSession: OnboardingService.getUserActiveOnboarding({ userId: user.id, tenantId: null, request }),
    }),
    "loadAdminData.getDetails"
  );
  const data: AdminLoaderData = {
    user,
    myTenants,
    currentTenant: null,
    entities,
    entityGroups,
    // roles,
    allRoles,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    isSuperUser: !!superAdminRole,
    isSuperAdmin: !!superAdminRole,
    myGroups,
    lng: user?.locale ?? userInfo.lng,
    onboardingSession,
    tenantTypes: await getAllTenantTypes(),
  };
  return data;
}
