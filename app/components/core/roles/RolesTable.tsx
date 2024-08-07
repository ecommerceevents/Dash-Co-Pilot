import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import Modal from "~/components/ui/modals/Modal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { RoleWithPermissionsAndUsers } from "~/utils/db/permissions/roles.db.server";
import RoleBadge from "./RoleBadge";

interface Props {
  items: RoleWithPermissionsAndUsers[];
  className?: string;
  canUpdate: boolean;
  tenantId?: string | null;
}

export default function RolesTable({ items, canUpdate = true, tenantId = null }: Props) {
  const { t } = useTranslation();

  const [actions, setActions] = useState<any[]>([]);
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RoleWithPermissionsAndUsers>[]>([]);

  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRow] = useState<RoleWithPermissionsAndUsers>();

  useEffect(() => {
    if (canUpdate) {
      setActions([
        {
          title: t("shared.edit"),
          onClickRoute: (_: any, item: any) => item.id,
        },
      ]);
    }

    const headers: RowHeaderDisplayDto<RoleWithPermissionsAndUsers>[] = [
      {
        name: "name",
        title: t("models.role.name"),
        value: (i) => i.name,
        formattedValue: (i) => <RoleBadge item={i} />,
        className: "max-w-xs truncate",
      },
      {
        name: "description",
        title: t("models.role.description"),
        value: (i) => i.description,
        className: "max-w-xs truncate",
      },
      {
        name: "permissions",
        title: t("models.role.permissions"),
        value: (i) => i.permissions.length,
        formattedValue: (i) => (
          <div className="w-40 truncate">
            {tenantId ? (
              <ButtonTertiary onClick={() => setSelectedRow(i)}>View {i.permissions.length} permissions</ButtonTertiary>
            ) : (
              <div>
                {i.permissions.length} <span className="max-w-sm text-xs italic text-gray-400">({i.permissions.map((f) => f.permission.name).join(", ")})</span>{" "}
              </div>
            )}
          </div>
        ),
        className: "max-w-xs truncate",
      },
      {
        name: "users",
        title: t("models.user.plural"),
        value: (i) => i.users.filter((f) => f.tenantId === tenantId).length,
      },
    ];
    if (!tenantId) {
      headers.push({
        name: "assignToNewUsers",
        title: t("models.role.assignToNewUsers"),
        value: (i) => i.assignToNewUsers,
        formattedValue: (i) => (i.assignToNewUsers ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-300" />),
      });
    }
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUpdate]);

  useEffect(() => {
    setPermissionsModalOpen(selectedRole !== undefined);
  }, [selectedRole]);

  useEffect(() => {
    if (!permissionsModalOpen) {
      setSelectedRow(undefined);
    }
  }, [permissionsModalOpen]);

  return (
    <div>
      <TableSimple actions={actions} headers={headers} items={items} />

      <Modal open={permissionsModalOpen} setOpen={setPermissionsModalOpen}>
        <div className="flex items-baseline justify-between space-x-2">
          <h4 className="text-lg font-bold">{selectedRole?.name}</h4>
          <p className="text-sm text-gray-500">
            {selectedRole?.permissions.length} {t("models.permission.plural").toLowerCase()}
          </p>
        </div>
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
      </Modal>
    </div>
  );
}
