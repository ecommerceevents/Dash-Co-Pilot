import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { DefaultPermission } from "~/application/dtos/shared/DefaultPermissions";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import { createPermissions, getAllPermissions } from "~/utils/db/permissions/permissions.db.server";
import { createRolePermission } from "~/utils/db/permissions/rolePermissions.db.server";
import { createRole, getAllRoles, getRoleByName } from "~/utils/db/permissions/roles.db.server";
import { createUserRole } from "~/utils/db/permissions/userRoles.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { adminGetAllUsers } from "~/utils/db/users.db.server";
import { getEntityPermissions } from "~/utils/helpers/PermissionsHelper";

export interface CreateRoleDto {
  name: string;
  description: string;
  type: "admin" | "app";
  assignToNewUsers: boolean;
}
export const defaultAdminRoles: CreateRoleDto[] = [
  // /admin
  { name: DefaultAdminRoles.SuperAdmin, description: "Has all admin permissions", type: "admin", assignToNewUsers: false },
  { name: DefaultAdminRoles.ProductDesigner, description: "Manages entities", type: "admin", assignToNewUsers: false },
  { name: DefaultAdminRoles.Developer, description: "Manages API Keys", type: "admin", assignToNewUsers: false },
  { name: DefaultAdminRoles.Auditor, description: "Views application audit trails", type: "admin", assignToNewUsers: false },
  { name: DefaultAdminRoles.Marketing, description: "Manages blog", type: "admin", assignToNewUsers: false },
  { name: DefaultAdminRoles.Guest, description: "Views admin pages, but cannot update or delete", type: "admin", assignToNewUsers: true },
];

export const defaultAppRoles: CreateRoleDto[] = [
  // /app
  { name: DefaultAppRoles.SuperUser, description: "Has all app permissions", type: "app", assignToNewUsers: false },
  { name: DefaultAppRoles.Admin, description: "Has all app permissions but account deletion", type: "app", assignToNewUsers: false },
  { name: DefaultAppRoles.BillingAdmin, description: "Has subscription permissions", type: "app", assignToNewUsers: false },
  { name: DefaultAppRoles.User, description: "Has regular permissions", type: "app", assignToNewUsers: true },
];

export interface CreatePermissionDto {
  inRoles: string[];
  name: DefaultPermission;
  description: string;
  type: string;
}
export const defaultPermissions: CreatePermissionDto[] = [
  {
    inRoles: [
      DefaultAdminRoles.SuperAdmin,
      DefaultAdminRoles.Marketing,
      DefaultAdminRoles.ProductDesigner,
      DefaultAdminRoles.Developer,
      DefaultAdminRoles.Auditor,
      DefaultAdminRoles.Guest,
    ],
    name: "admin.dashboard.view",
    description: "View dashboard page",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Guest], name: "admin.accounts.view", description: "View accounts page", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.accounts.create", description: "Create accounts", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Guest], name: "admin.account.view", description: "View account page", type: "admin" },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin],
    name: "admin.account.settings.update",
    description: "Update account settings",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.account.users", description: "View account users", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.account.subscription", description: "Update account subscription", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.account.delete", description: "Delete account", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Guest], name: "admin.accountTypes.view", description: "View account types page", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.accountTypes.create", description: "Create account types", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.accountTypes.update", description: "Update account types", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.accountTypes.delete", description: "Delete account types", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Guest], name: "admin.users.view", description: "View users page", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.users.impersonate", description: "Can impersonate users", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.users.changePassword", description: "Can change user passwords", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.users.delete", description: "Delete users", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.relationships.view", description: "View account relationships page", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.relationships.create", description: "Create account relationships", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.relationships.update", description: "Update account relationships", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.relationships.delete", description: "Delete account relationships", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Guest], name: "admin.blacklist.view", description: "View blacklist", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.tenantIpAddress.view", description: "View IP addresses", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.blacklist.manage", description: "Can manage blacklist", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Guest], name: "admin.roles.view", description: "View roles & permissions page", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.create", description: "Create roles & permissions", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.update", description: "Update role & permission", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.delete", description: "Delete role & permission", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.set", description: "Set user roles", type: "admin" },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Marketing, DefaultAdminRoles.Guest],
    name: "admin.analytics.view",
    description: "View analytics",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.analytics.delete", description: "Delete analytics data", type: "admin" },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Marketing, DefaultAdminRoles.Guest],
    name: "admin.blog.view",
    description: "View blog posts page",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Marketing], name: "admin.blog.create", description: "Create blog posts", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Marketing], name: "admin.blog.update", description: "Update blog post", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Marketing], name: "admin.blog.delete", description: "Delete blog post", type: "admin" },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner, DefaultAdminRoles.Guest],
    name: "admin.entities.view",
    description: "View entities page",
    type: "admin",
  },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner],
    name: "admin.entities.create",
    description: "Create entities",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner], name: "admin.entities.update", description: "Update entity", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner], name: "admin.entities.delete", description: "Delete entity", type: "admin" },

  // {
  //   inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner, DefaultAdminRoles.Guest, DefaultAdminRoles.Developer, DefaultAdminRoles.Auditor],
  //   name: "admin.workflows.view",
  //   description: "View workflows page",
  //   type: "admin",
  // },
  // {
  //   inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner, DefaultAdminRoles.Developer],
  //   name: "admin.workflows.create",
  //   description: "Create workflows",
  //   type: "admin",
  // },
  // {
  //   inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner, DefaultAdminRoles.Developer],
  //   name: "admin.workflows.update",
  //   description: "Update workflow",
  //   type: "admin",
  // },
  // {
  //   inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner, DefaultAdminRoles.Developer],
  //   name: "admin.workflows.delete",
  //   description: "Delete workflow",
  //   type: "admin",
  // },

  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Developer, DefaultAdminRoles.Guest],
    name: "admin.apiKeys.view",
    description: "View API Keys page",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Developer], name: "admin.apiKeys.create", description: "Create API Key", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Developer], name: "admin.apiKeys.update", description: "Update API Key", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Developer], name: "admin.apiKeys.delete", description: "Delete API Key", type: "admin" },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Auditor, DefaultAdminRoles.Guest],
    name: "admin.auditTrails.view",
    description: "View Audit Trails page",
    type: "admin",
  },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.Auditor, DefaultAdminRoles.Developer],
    name: "admin.events.view",
    description: "View Events and Webhooks page",
    type: "admin",
  },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner, DefaultAdminRoles.Guest],
    name: "admin.pricing.view",
    description: "View API Keys page",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner], name: "admin.pricing.create", description: "Create plan", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner], name: "admin.pricing.update", description: "Update plan", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner], name: "admin.pricing.delete", description: "Delete plan", type: "admin" },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner, DefaultAdminRoles.Guest],
    name: "admin.emails.view",
    description: "View email templates page",
    type: "admin",
  },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner],
    name: "admin.emails.create",
    description: "Create email template",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner], name: "admin.emails.update", description: "Update email", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAdminRoles.ProductDesigner], name: "admin.emails.delete", description: "Delete delete", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.pages.view", description: "View page blocks", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.pages.create", description: "Create page", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.pages.update", description: "Update page", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.pages.delete", description: "Delete page", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.onboarding.view", description: "View onboardings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.onboarding.create", description: "Create onboarding", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.onboarding.update", description: "Update onboarding", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.onboarding.delete", description: "Delete onboarding", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.notifications.view", description: "View notifications", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.featureFlags.view", description: "View feature flags", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.featureFlags.manage", description: "Manage feature flags", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.prompts.view", description: "View prompts", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.prompts.create", description: "Create prompt", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.prompts.update", description: "Update prompt", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.prompts.delete", description: "Delete prompt", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.formulas.view", description: "View formulas", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.formulas.create", description: "Create formula", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.formulas.update", description: "Update formula", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.formulas.delete", description: "Delete formula", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.metrics.view", description: "View metrics", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.metrics.update", description: "Update metrics", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.metrics.delete", description: "Delete metrics", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.kb.view", description: "View knowledge bases", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.kb.create", description: "Create knowledge bases", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.kb.update", description: "Update knowledge bases", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.kb.delete", description: "Delete knowledge bases", type: "admin" },

  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.general.view", description: "View general settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.general.update", description: "Update general settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.authentication.view", description: "View authentication settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.authentication.update", description: "Update authentication settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.analytics.view", description: "View analytics settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.analytics.update", description: "Update analytics settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.seo.update", description: "Update SEO settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.cookies.view", description: "View cookies settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.cookies.create", description: "Create cookies settings", type: "admin" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.cookies.update", description: "Update cookies settings", type: "admin" },

  {
    inRoles: [DefaultAdminRoles.SuperAdmin],
    name: "admin.settings.internationalization.view",
    description: "View internationalization settings",
    type: "admin",
  },
  {
    inRoles: [DefaultAdminRoles.SuperAdmin],
    name: "admin.settings.internationalization.update",
    description: "Update internationalization settings",
    type: "admin",
  },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.settings.danger.reset", description: "Reset settings", type: "admin" },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin, DefaultAppRoles.User],
    name: "app.dashboard.view",
    description: "View dashboard page",
    type: "app",
  },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.members.view", description: "View members page", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.members.create", description: "Create member", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.members.update", description: "Update member", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.members.delete", description: "Delete member", type: "app" },
  { inRoles: [DefaultAdminRoles.SuperAdmin], name: "app.settings.members.impersonate", description: "Impersonate member", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.roles.view", description: "View user roles", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.roles.set", description: "Set user roles", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.groups.full", description: "Manage all user groups", type: "app" },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin, DefaultAppRoles.BillingAdmin],
    name: "app.settings.subscription.view",
    description: "View account's subscription page",
    type: "app",
  },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin, DefaultAppRoles.BillingAdmin],
    name: "app.settings.subscription.update",
    description: "Subscribe to plan",
    type: "app",
  },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin, DefaultAppRoles.BillingAdmin],
    name: "app.settings.subscription.delete",
    description: "Cancel subscription",
    type: "app",
  },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin, DefaultAppRoles.BillingAdmin],
    name: "app.settings.subscription.invoices.view",
    description: "Views invoices",
    type: "app",
  },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.account.view", description: "View account settings page", type: "app" },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin],
    name: "app.settings.account.update",
    description: "Update account settings",
    type: "app",
  },
  { inRoles: [DefaultAppRoles.SuperUser], name: "app.settings.account.delete", description: "Delete account", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.accounts.view", description: "View accounts page", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.accounts.create", description: "Create account", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.accounts.update", description: "Update account", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.accounts.delete", description: "Delete account", type: "app" },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin],
    name: "app.settings.linkedAccounts.view",
    description: "View linked accounts page",
    type: "app",
  },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin],
    name: "app.settings.linkedAccounts.create",
    description: "Create linked account",
    type: "app",
  },
  {
    inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin],
    name: "app.settings.linkedAccounts.delete",
    description: "Delete linked account",
    type: "app",
  },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.apiKeys.view", description: "View API Keys page", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.apiKeys.create", description: "Create API Key", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.apiKeys.update", description: "Update API Key", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.apiKeys.delete", description: "Delete API Key", type: "app" },
  { inRoles: [DefaultAppRoles.SuperUser, DefaultAppRoles.Admin], name: "app.settings.auditTrails.view", description: "View Audit Trails page", type: "app" },
];

export async function seedRolesAndPermissions(adminEmail?: string): Promise<void> {
  const adminRoles = await seedRoles(defaultAdminRoles);
  // eslint-disable-next-line no-console
  console.log("🌱 Seeding admin roles and permissions", adminRoles.length);

  const appRoles = await seedRoles(defaultAppRoles);
  // eslint-disable-next-line no-console
  console.log("🌱 Seeding app roles and permissions", appRoles.length);

  let appPermissions = defaultPermissions.filter((f) => f.type === "app");
  await createPermissions(defaultPermissions);

  const entities = await getAllEntities({ tenantId: null, active: true });
  await Promise.all(
    entities.map(async (entity) => {
      return (await getEntityPermissions(entity)).map(async (permission) => {
        const entityPermission = {
          inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAppRoles.SuperUser, DefaultAppRoles.Admin, DefaultAppRoles.User].map((f) => f.toString()),
          name: permission.name as DefaultPermission,
          description: permission.description,
          type: entity.type,
        };
        appPermissions.push(entityPermission);
        return await createPermissions([entityPermission], appPermissions.length + 1);
      });
    })
  );

  const users = (await adminGetAllUsers()).items;
  await Promise.all(
    users
      .filter((f) => f.admin)
      .map(async (user) => {
        adminRoles.map(async (adminRole) => {
          if (adminEmail && user.email === adminEmail) {
            return await createUserRole(user.id, adminRole.id);
          }
        });
      })
  );

  const tenants = await adminGetAllTenants();
  await Promise.all(
    tenants.map(async (tenant) => {
      tenant.users.map(async (tenantUser) => {
        appRoles.map(async (appRole) => {
          return await createUserRole(tenantUser.userId, appRole.id, tenant.id);
        });
      });
    })
  );

  const guestRole = await getRoleByName(DefaultAdminRoles.Guest);
  if (guestRole) {
    const viewAndReadPermissions = (await getAllPermissions()).filter((f) => f.name.includes(".view") || f.name.includes(".read"));
    await Promise.all(
      viewAndReadPermissions.map(async (permission) => {
        return await createRolePermission({
          roleId: guestRole.id,
          permissionId: permission.id,
        });
      })
    );
  }
}

async function seedRoles(roles: CreateRoleDto[]) {
  const allRoles = await getAllRoles();
  await Promise.all(
    roles.map(async (data, idx) => {
      const existing = allRoles.find((f) => f.name === data.name);
      if (existing) {
        return;
      }
      const role = await createRole({
        ...data,
        order: idx + 1,
        isDefault: true,
      });
      await new Promise((r) => setTimeout(r, 10));
      return role;
    })
  );
  return await getAllRoles();
}
