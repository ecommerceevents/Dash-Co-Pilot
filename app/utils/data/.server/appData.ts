import { Params } from "@remix-run/react";
import { redirect } from "remix-typedjson";
import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { DefaultEntityTypes } from "~/application/dtos/shared/DefaultEntityTypes";
import { DefaultPermission } from "~/application/dtos/shared/DefaultPermissions";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { TimeFunction } from "~/modules/metrics/services/.server/MetricTracker";
import OnboardingService from "~/modules/onboarding/services/OnboardingService";
import { TenantEntitiesApi } from "~/utils/api/.server/TenantEntitiesApi";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import { getAllEntityGroups, EntityGroupWithDetails } from "~/utils/db/entities/entityGroups.db.server";
import { getLinkedAccountsCount } from "~/utils/db/linkedAccounts.db.server";
import { getMyGroups } from "~/utils/db/permissions/groups.db.server";
import { getAllRolesWithoutPermissions } from "~/utils/db/permissions/roles.db.server";
import { getPermissionsByUser, getUserRoleInTenant, getUserRoleInAdmin } from "~/utils/db/permissions/userRoles.db.server";
import { getTenantSimple, getMyTenants, getTenantUserType } from "~/utils/db/tenants.db.server";
import { getTenantRelationshipsFromByUserTenants } from "~/utils/db/tenants/tenantRelationships.db.server";
import { getAllTenantTypes } from "~/utils/db/tenants/tenantTypes.db.server";
import { promiseHash } from "~/utils/promises/promiseHash";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getActiveTenantSubscriptions, getPlanFeatureUsage } from "~/utils/services/.server/subscriptionService";
import { getUserInfo } from "~/utils/session.server";
import { AppLoaderData } from "../useAppData";
import { getUser } from "~/utils/db/users.db.server";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { CreditTypes } from "~/modules/usage/dtos/CreditType";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { getTranslations } from "~/locale/i18next.server";
import { TFunction } from "i18next";

export async function loadAppData({ request, params, t }: { request: Request; params: Params; t: TFunction }, time: TimeFunction) {
  const { tenantId, userInfo } = await time(
    promiseHash({
      tenantId: getTenantIdFromUrl(params),
      userInfo: getUserInfo(request),
    }),
    "loadAppData.session"
  );

  const url = new URL(request.url);
  if (UrlUtils.stripTrailingSlash(url.pathname) === UrlUtils.stripTrailingSlash(UrlUtils.currentTenantUrl(params))) {
    throw redirect(UrlUtils.currentTenantUrl(params, "dashboard"));
  }
  const { user, currentTenant } = await time(
    promiseHash({
      user: getUser(userInfo?.userId),
      currentTenant: getTenantSimple(tenantId),
    }),
    "loadAppData.getUserAndTenant"
  );

  const redirectTo = url.pathname + url.search;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  if (!currentTenant) {
    throw redirect(`/app`);
  }
  let {
    myTenants,
    pendingInvitations,
    mySubscription,
    allPermissions,
    superUserRole,
    superAdminRole,
    entities,
    entityGroups,
    allRoles,
    myGroups,
    onboardingSession,
  } = await time(
    promiseHash({
      myTenants: time(getMyTenants(user.id), "loadAppData.getDetails.getMyTenants"),
      pendingInvitations: time(getLinkedAccountsCount(tenantId, [LinkedAccountStatus.PENDING]), "loadAppData.getDetails.getLinkedAccountsCount"),
      mySubscription: time(getActiveTenantSubscriptions(tenantId), "loadAppData.getDetails.getActiveTenantSubscriptions"),
      allPermissions: time(getPermissionsByUser(userInfo.userId, tenantId), "loadAppData.getDetails.getPermissionsByUser"),
      superUserRole: time(getUserRoleInTenant(userInfo.userId, tenantId, DefaultAppRoles.SuperUser), "loadAppData.getDetails.getUserRoleInTenant"),
      superAdminRole: time(getUserRoleInAdmin(userInfo.userId, DefaultAdminRoles.SuperAdmin), "loadAppData.getDetails.getUserRoleInAdmin"),
      entities: time(
        getAllEntities({ tenantId, active: true, types: [DefaultEntityTypes.All, DefaultEntityTypes.AppOnly] }),
        "loadAppData.getDetails.getAllEntities"
      ),
      entityGroups: time(getAllEntityGroups(), "loadAppData.getDetails.getAllEntityGroups()"),
      allRoles: time(getAllRolesWithoutPermissions("app"), "loadAppData.getDetails.getAllRolesWithoutPermissions"),
      myGroups: time(getMyGroups(user.id, currentTenant.id), "loadAppData.getDetails.getMyGroups"),
      onboardingSession: time(
        OnboardingService.getUserActiveOnboarding({ userId: user.id, tenantId: currentTenant.id, request }),
        "loadAppData.getDetails.OnboardingService.getUserActiveOnboarding"
      ),
    }),
    "loadAppData.getDetails"
  );
  const childTenants = await time(getTenantRelationshipsFromByUserTenants(myTenants.map((f) => f.id)), "loadAppData.getDetails.getTenantRelationshipsFrom");
  const currentTenantAsChild = childTenants.find((f) => f.toTenantId === currentTenant.id);
  if (currentTenantAsChild) {
    allPermissions = [...allPermissions, ...currentTenantAsChild.tenantTypeRelationship.permissions.map((f) => f.name)];
  }

  const tenantUser = await getTenantUserType(tenantId, userInfo.userId);
  let currentRole = tenantUser?.type ?? TenantUserType.MEMBER;
  if (user.admin) {
    currentRole = TenantUserType.ADMIN;
  }
  const tenantTypes = await getAllTenantTypes();
  if (tenantTypes.length > 0) {
    const tenantEntities = await TenantEntitiesApi.getEntities({ tenantId, inTypes: currentTenant.types, enabledOnly: true });
    entities = tenantEntities.allEntities;
    let newGroups: EntityGroupWithDetails[] = [];
    entityGroups.forEach((group) => {
      group.entities = group.entities.filter((f) => entities.some((e) => e.id === f.entityId));
      if (group.entities.length > 0) {
        newGroups.push(group);
      }
    });
    entityGroups = newGroups;
  }

  let credits: PlanFeatureUsageDto | undefined = undefined;
  if (CreditTypes.length > 0) {
    credits = await getPlanFeatureUsage(tenantId, DefaultFeatures.Credits);
  }
  const data: AppLoaderData = {
    // i18n: i18n.translations,
    user,
    myTenants,
    childTenants,
    currentTenant,
    currentRole,
    mySubscription,
    pendingInvitations,
    entities,
    entityGroups,
    // roles,
    allRoles,
    permissions: allPermissions.map((f) => f as DefaultPermission),
    myGroups,
    isSuperUser: !!superUserRole,
    isSuperAdmin: !!superAdminRole,
    lng: user?.locale ?? userInfo.lng,
    onboardingSession,
    tenantTypes,
    credits,
  };
  return data;
}
