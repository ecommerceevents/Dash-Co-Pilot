import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { Fragment, useEffect, useRef, useState } from "react";
import { getTenant, getTenantUsers, TenantUserWithUser } from "~/utils/db/tenants.db.server";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigate, useOutlet, useParams, useSubmit } from "@remix-run/react";
import { deleteUserInvitation, getUserInvitation, getUserInvitations } from "~/utils/db/tenantUserInvitations.db.server";
import MemberInvitationsListAndTable from "~/components/core/settings/members/MemberInvitationsListAndTable";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import InputSearch from "~/components/ui/input/InputSearch";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getUserPermission, verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { useAppData } from "~/utils/data/useAppData";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SettingSection from "~/components/ui/sections/SettingSection";
import { RoleWithPermissions, getAllRoles, getRole } from "~/utils/db/permissions/roles.db.server";
import { Permission, Role } from "@prisma/client";
import { UserWithRoles, getUser } from "~/utils/db/users.db.server";
import { useTranslation } from "react-i18next";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { createUserRole, deleteUserRole } from "~/utils/db/permissions/userRoles.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import UserRolesTable from "~/components/core/roles/UserRolesTable";
import Modal from "~/components/ui/modals/Modal";
import TableSimple from "~/components/ui/tables/TableSimple";
import RoleBadge from "~/components/core/roles/RoleBadge";
import RolesAndPermissionsMatrix from "~/components/core/roles/RolesAndPermissionsMatrix";
import { getAllPermissions } from "~/utils/db/permissions/permissions.db.server";
import { GroupWithDetails, getAllGroups, getMyGroups } from "~/utils/db/permissions/groups.db.server";
import GroupsTable from "~/components/core/roles/GroupsTable";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import { useRootData } from "~/utils/data/useRootData";
import EventsService from "~/modules/events/services/.server/EventsService";
import { RoleAssignedDto } from "~/modules/events/dtos/RoleAssignedDto";
import { RoleUnassignedDto } from "~/modules/events/dtos/RoleUnassignedDto";

type LoaderData = {
  title: string;
  users: TenantUserWithUser[];
  pendingInvitations: Awaited<ReturnType<typeof getUserInvitations>>;
  roles: RoleWithPermissions[];
  permissions: Permission[];
  groups: GroupWithDetails[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);
  await verifyUserHasPermission(request, "app.settings.members.view", tenantId);

  const users = await getTenantUsers(tenantId);
  const pendingInvitations = await getUserInvitations(tenantId);

  const roles = await getAllRoles("app");
  const permissions = await getAllPermissions("app");

  const { permission, userPermission } = await getUserPermission({
    userId: userInfo.userId,
    permissionName: "app.settings.groups.full",
    tenantId: tenantId,
  });
  let groups: GroupWithDetails[];
  if (!permission || userPermission) {
    groups = await getAllGroups(tenantId);
  } else {
    groups = await getMyGroups(userInfo.userId, tenantId);
  }

  const data: LoaderData = {
    title: `${t("settings.members.title")} | ${process.env.APP_NAME}`,
    users,
    pendingInvitations,
    roles,
    permissions,
    groups,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();
  const fromUser = await getUser(userInfo.userId);
  if (!fromUser) {
    return badRequest({ error: "Invalid user" });
  }

  if (action === "delete-invitation") {
    const invitationId = form.get("invitation-id")?.toString() ?? "";
    const invitation = await getUserInvitation(invitationId);
    if (!invitation) {
      return badRequest({
        error: "Invitation not found",
      });
    }
    await deleteUserInvitation(invitation.id);
    return json({ success: "Invitation deleted" });
  }
  if (action === "edit") {
    const userId = form.get("user-id")?.toString() ?? "";
    const roleId = form.get("role-id")?.toString() ?? "";
    const add = form.get("add") === "true";

    const tenant = await getTenant(tenantId);
    const user = await getUser(userId);
    const role = await getRole(roleId);

    if (!user || !role || !tenant) {
      return badRequest({ error: t("shared.invalidForm") });
    }

    if (role?.name === DefaultAppRoles.SuperUser) {
      const allMembers = await getTenantUsers(tenantId);
      const superAdmins = allMembers.filter((m) => m.user.roles.some((r) => r.tenantId === tenantId && r.role.name === DefaultAppRoles.SuperUser));
      if (superAdmins.length === 1 && !add) {
        return badRequest({
          error: "There must be at least one super admin",
        });
      }
      if (userId === userInfo.userId) {
        return badRequest({
          error: "You cannot remove yourself from the super admin role",
        });
      }
    }
    if (add) {
      await createUserRole(userId, roleId, tenantId);
      if (fromUser && user && role) {
        await EventsService.create({
          request,
          event: "role.assigned",
          tenantId,
          userId: fromUser.id,
          data: {
            fromUser: { id: fromUser.id, email: fromUser.email },
            toUser: { id: user.id, email: user.email },
            role: { id: role.id, name: role.name, description: role.description },
          } satisfies RoleAssignedDto,
        });
      }
      createAdminLog(request, "Created", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    } else {
      await EventsService.create({
        request,
        event: "role.unassigned",
        tenantId: tenant?.id ?? null,
        userId: fromUser.id,
        data: {
          fromUser: { id: fromUser.id, email: fromUser.email },
          toUser: { id: user.id, email: user.email },
          role: { id: role.id, name: role.name, description: role.description },
        } satisfies RoleUnassignedDto,
      });
      await deleteUserRole(userId, roleId, tenantId);
      createAdminLog(request, "Deleted", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    }
    return json({});
  } else if (action === "impersonate") {
    const userId = form.get("user-id")?.toString();
    const user = await getUser(userId);
    if (!user) {
      return badRequest({ error: t("shared.notFound") });
    }
    if (user.admin) {
      return badRequest({ error: "You cannot impersonate a super admin user" });
    }
    const userSession = await setLoggedUser(user);
    if (!userSession) {
      return badRequest({ error: t("shared.notFound") });
    }
    const tenant = await getTenant(userSession.defaultTenantId);
    return createUserSession(
      {
        ...userInfo,
        ...userSession,
        impersonatingFromUserId: userInfo.userId,
      },
      tenant ? `/app/${tenant.slug ?? tenant.id}/dashboard` : "/app"
    );
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const params = useParams();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const rootData = useRootData();
  const appData = useAppData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const outlet = useOutlet();

  const errorModal = useRef<RefErrorModal>(null);
  const confirmUpgrade = useRef<RefConfirmModal>(null);

  const [searchInput, setSearchInput] = useState("");

  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions>();
  const [showRolesAndPermissions, setShowRolesAndPermissions] = useState(false);

  useEffect(() => {
    setPermissionsModalOpen(selectedRole !== undefined);
  }, [selectedRole]);

  useEffect(() => {
    if (!permissionsModalOpen) {
      setSelectedRole(undefined);
    }
  }, [permissionsModalOpen]);

  function yesUpdateSubscription() {
    navigate(UrlUtils.currentTenantUrl(params, `settings/subscription`));
  }
  const filteredItems = () => {
    if (!data.users) {
      return [];
    }
    return data.users.filter(
      (f) =>
        f.user.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.phone?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };
  const sortedItems = () => {
    if (!data.users) {
      return [];
    }
    const filtered = filteredItems()
      .slice()
      .sort((x, y) => {
        return x.type > y.type ? -1 : 1;
      });
    return filtered.sort((x, y) => {
      return x.type > y.type ? 1 : -1;
    });
  };

  function onSetRole(item: UserWithRoles, role: Role, add: any) {
    const form = new FormData();
    form.set("action", "edit");
    form.set("user-id", item.id);
    form.set("role-id", role.id);
    form.set("add", add ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  function onImpersonate(item: UserWithRoles) {
    if (!getUserHasPermission(appData, "app.settings.members.impersonate")) {
      return undefined;
    }
    const form = new FormData();
    form.set("action", "impersonate");
    form.set("user-id", item.id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout>
      <SettingSection
        size="lg"
        title="Members"
        description={
          <div className="flex flex-col space-y-1">
            <div>Manage team members.</div>
            <div>
              <button type="button" className="text-left underline" onClick={() => setShowRolesAndPermissions(true)}>
                View all roles and permissions
              </button>
            </div>
          </div>
        }
        className="p-1"
      >
        <div className="space-y-2">
          <InputSearch
            value={searchInput}
            setValue={setSearchInput}
            onNewRoute={!getUserHasPermission(appData, "app.settings.members.create") ? "" : UrlUtils.currentTenantUrl(params, "settings/members/new")}
          />
          <div className="space-y-2">
            <UserRolesTable
              items={sortedItems().map((f) => f.user)}
              roles={data.roles}
              onChange={onSetRole}
              tenantId={appData.currentTenant.id}
              disabled={!getUserHasPermission(appData, "app.settings.roles.set")}
              onRoleClick={(role) => setSelectedRole(role)}
              actions={{
                onEditRoute: (item) => {
                  const tenantUser = data.users?.find((f) => f.user.id === item.id);
                  return UrlUtils.currentTenantUrl(params, `settings/members/edit/${tenantUser?.id}`);
                },
                onImpersonate: !getUserHasPermission(appData, "app.settings.members.impersonate") ? undefined : onImpersonate,
              }}
            />

            <Modal open={permissionsModalOpen} setOpen={setPermissionsModalOpen}>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between space-x-2">
                  <h4 className="text-lg font-bold">{selectedRole?.name}</h4>
                  <p className="text-sm text-gray-500">
                    {selectedRole?.permissions.length} {t("models.permission.plural")?.toLowerCase()}
                  </p>
                </div>
                <div className="h-96 max-h-96 overflow-y-scroll p-1">
                  <TableSimple
                    headers={[
                      {
                        name: "name",
                        title: t("models.permission.name"),
                        value: (i) => i.permission.name,
                        formattedValue: (i) => <RoleBadge item={i.permission} />,
                      },
                      {
                        name: "description",
                        title: t("models.permission.description"),
                        value: (i) => i.permission.description,
                      },
                    ]}
                    items={selectedRole?.permissions ?? []}
                  />
                </div>
              </div>
            </Modal>

            <Modal size="4xl" open={showRolesAndPermissions} setOpen={setShowRolesAndPermissions}>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between space-x-2">
                  <h4 className="text-lg font-bold">Roles and Permissions</h4>
                  <p className="text-sm text-gray-500">
                    {data.permissions.length} {t("models.permission.plural")?.toLowerCase()}
                  </p>
                </div>
                <div className="p-1">
                  <RolesAndPermissionsMatrix roles={data.roles} permissions={data.permissions} className="h-96 max-h-96 overflow-y-scroll" />
                </div>
              </div>
            </Modal>

            {data.pendingInvitations.length > 0 && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Pending Invitations</label>
                <MemberInvitationsListAndTable items={data.pendingInvitations} canDelete={getUserHasPermission(appData, "app.settings.members.delete")} />
              </div>
            )}
          </div>
        </div>
      </SettingSection>

      {/*Separator */}
      {/* <div className="block">
        <div className="py-5">
          <div className="border-t border-border"></div>{" "}
        </div>
      </div> */}

      {/* {getUserHasPermission(appData, "app.settings.roles.view") && (
        <SettingSection
        size="lg"
          title="Roles"
          description={
            <div className="flex flex-col space-y-1">
              <div>Manage user roles</div>
              <div>
                {appData.mySubscription?.products && appData.mySubscription.products.length > 0 && (
                  <button type="button" className="text-left underline" onClick={() => setShowRolesAndPermissions(true)}>
                    View all roles and permissions
                  </button>
                )}
              </div>
            </div>
          }
          className="p-1"
        >
          
        </SettingSection>
      )} */}

      {rootData.featureFlags?.includes("row-groups") && (
        <Fragment>
          {/*Separator */}
          <div className="block">
            <div className="py-5">
              <div className="border-border border-t"></div>{" "}
            </div>
          </div>

          <SettingSection size="lg" title="Groups" description="Manage your groups" className="p-1">
            <GroupsTable items={data.groups} onNewRoute="groups/new" />
          </SettingSection>
        </Fragment>
      )}

      <SlideOverWideEmpty
        title={params.id ? "Edit Member" : "New Member"}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>

      <ActionResultModal actionData={actionData} showSuccess={false} />
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmUpgrade} onYes={yesUpdateSubscription} />
    </EditPageLayout>
  );
}
