import { Log, Role, User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSubmit } from "@remix-run/react";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { UserWithDetails } from "~/utils/db/users.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import UserBadge from "./UserBadge";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { RowHeaderActionDto } from "~/application/dtos/data/RowHeaderActionDto";

interface Props {
  items: UserWithDetails[];
  canImpersonate: boolean;
  canChangePassword: boolean;
  canSetUserRoles?: boolean;
  canDelete: boolean;
  pagination?: PaginationDto;
  lastLogs?: { userId: string; log: Log }[];
}
export default function UsersTable({ items, canImpersonate, canChangePassword, canSetUserRoles, canDelete, pagination, lastLogs }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<UserWithDetails>[]>([]);
  const [actions, setActions] = useState<RowHeaderActionDto<UserWithDetails>[]>([]);

  useEffect(() => {
    function getUserRoles(user: UserWithDetails, tenantId: string | null): Role[] {
      const roles: Role[] = [];
      user.roles
        .filter((f) => (tenantId ? f.tenantId === tenantId && f.role.type === "app" : f.role.type === "admin"))
        .forEach((role) => {
          if (roles.find((f) => f.name === role.role.name) === undefined) {
            roles.push(role.role);
          }
        });
      // sort by type then by order
      const sorted = roles.sort((a, b) => {
        if (a.type === b.type) {
          return a.order - b.order;
        }
        // sort by type (text)
        return a.type.localeCompare(b.type);
      });
      return sorted;
    }
    const headers: RowHeaderDisplayDto<UserWithDetails>[] = [
      {
        name: "user",
        title: t("models.user.object"),
        value: (i) => i.email,
        formattedValue: (item) => <UserBadge item={item} admin={item.admin} withAvatar={true} withSignUpMethod={true} />,
        sortBy: "email",
      },
      {
        name: "tenants",
        title: t("app.users.accountsAndRoles"),
        value: (i) => (
          <div className="max-w-sm truncate">
            <div
              className="truncate italic text-gray-500"
              title={getUserRoles(i, null)
                .map((x) => x.name)
                .join(", ")}
            >
              {getUserRoles(i, null)
                .map((x) => x.name)
                .join(", ")}
            </div>
            {i.tenants.map((f) => {
              return (
                <div key={f.id} className="truncate">
                  <Link
                    to={"/app/" + f.tenant.slug}
                    className="border-b border-dashed border-transparent hover:border-dashed hover:border-gray-400 focus:bg-gray-100"
                  >
                    <span>{f.tenant.name}</span>
                  </Link>{" "}
                  {getUserRoles(i, f.tenantId).length > 0 ? (
                    <span
                      className="truncate text-xs italic text-gray-500"
                      title={getUserRoles(i, f.tenantId)
                        .map((x) => x.name)
                        .join(", ")}
                    >
                      (
                      {getUserRoles(i, f.tenantId)
                        .map((x) => x.name)
                        .join(", ")}
                      )
                    </span>
                  ) : (
                    <span className="truncate text-xs italic text-red-500">({t("app.users.undefinedRoles")})</span>
                  )}
                </div>
              );
            })}
          </div>
        ),
      },
      {
        name: "lastActivity",
        title: t("shared.lastActivity"),
        value: (item) => <LastActivity item={item} lastLogs={lastLogs} />,
      },
      {
        name: "createdAt",
        title: t("shared.createdAt"),
        value: (i) => DateUtils.dateDM(i.createdAt),
        formattedValue: (item) => (
          <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
            {DateUtils.dateAgo(item.createdAt)}
          </time>
        ),
        sortBy: "createdAt",
      },
    ];

    const actions: RowHeaderActionDto<UserWithDetails>[] = [];
    if (canImpersonate) {
      actions.push({
        title: t("models.user.impersonate"),
        onClick: (_, item) => impersonate(item),
        disabled: (_) => !canImpersonate,
      });
    }
    if (canChangePassword) {
      actions.push({
        title: t("settings.profile.changePassword"),
        onClick: (_, item) => changePassword(item),
        disabled: (_) => !canChangePassword,
      });
    }
    if (canSetUserRoles) {
      actions.push({
        title: t("admin.users.setAdminRoles"),
        onClickRoute: (_, item) => `/admin/accounts/users/${item.email}/roles`,
      });
    }
    if (canDelete) {
      actions.push({
        title: t("shared.delete"),
        onClick: (_, item) => deleteUser(item),
        disabled: (_) => !canDelete,
        destructive: true,
      });
    }

    setActions(actions);
    setHeaders(headers);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lastLogs, t]);

  function impersonate(user: UserWithDetails) {
    const form = new FormData();
    form.set("action", "impersonate");
    form.set("user-id", user.id);
    submit(form, {
      action: "/admin/accounts/users",
      method: "post",
    });
  }
  function changePassword(user: UserWithDetails) {
    const password = prompt(t("settings.profile.changePassword") + " - " + user.email);
    if (password && confirm("[ADMINISTRATOR] Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("action", "change-password");
      form.set("user-id", user.id);
      form.set("password-new", password);
      submit(form, {
        action: "/admin/accounts/users",
        method: "post",
      });
    }
  }
  function deleteUser(item: UserWithDetails) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("admin.users.deleteWarning"));
    }
  }
  function confirmDeleteUser(item: User) {
    const form = new FormData();
    form.set("action", "delete-user");
    form.set("user-id", item.id);
    submit(form, {
      action: "/admin/accounts/users",
      method: "post",
    });
  }

  return (
    <div>
      <TableSimple items={items} headers={headers} actions={actions} pagination={pagination} />
      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteUser} destructive />
    </div>
  );
}

function LastActivity({ item, lastLogs, action }: { item: UserWithDetails; lastLogs?: { userId: string; log: Log }[]; action?: string }) {
  const lastLog = lastLogs?.find((f) => f.userId === item.id && (!action || f.log.action === action));
  if (lastLog) {
    return (
      <div className="text-sm text-gray-500">
        {!action && lastLog.log.action} {DateUtils.dateAgo(lastLog.log.createdAt)}
      </div>
    );
  }
  return null;
}
