import { Permission } from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import InputSearch from "~/components/ui/input/InputSearch";
import TableSimple from "~/components/ui/tables/TableSimple";
import { RoleWithPermissions } from "~/utils/db/permissions/roles.db.server";

interface Props {
  roles: RoleWithPermissions[];
  permissions: Permission[];
  className?: string;
}
export default function RolesAndPermissionsMatrix({ roles, permissions, className }: Props) {
  const [searchInput, setSearchInput] = useState("");
  function getHeaders() {
    const headers: RowHeaderDisplayDto<Permission>[] = [];
    headers.push({
      name: "permission",
      title: "Permission",
      className: "w-full",
      value: (item) => (
        <div className="max-w-xs truncate">
          <div>{item.name}</div>
          <div className="truncate text-sm text-gray-500">{item.description}</div>
        </div>
      ),
    });
    roles.forEach((role) => {
      headers.push({
        name: role.name,
        title: `${role.name} (${role.permissions.length})`,
        align: "center",
        value: (permission) => {
          const existing = role.permissions.find((f) => f.permission.name === permission.name);
          return (
            <div className="flex justify-center">
              <div
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  existing ? "bg-green-100 text-green-500" : "bg-gray-100 text-gray-500"
                )}
              >
                {existing ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-gray-500" />}
              </div>
            </div>
          );
        },
      });
    });
    return headers;
  }
  function filteredItems() {
    if (!searchInput) return permissions;
    return permissions.filter(
      (f) => f.name.toLowerCase().includes(searchInput.toLowerCase()) || f.description.toLowerCase().includes(searchInput.toLowerCase())
    );
  }
  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <div className={className}>
        <TableSimple items={filteredItems()} headers={getHeaders()} />
      </div>
    </div>
  );
}
