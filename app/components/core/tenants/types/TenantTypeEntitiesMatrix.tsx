import clsx from "clsx";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { TenantTypeDto } from "~/application/dtos/tenants/TenantTypeDto";
import { TenantTypeEntityDto } from "~/application/dtos/tenants/TenantTypeEntityDto";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import LockClosedIcon from "~/components/ui/icons/LockClosedIcon";
import XIcon from "~/components/ui/icons/XIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EntitySimple } from "~/utils/db/entities/entities.db.server";

interface Props {
  items: TenantTypeEntityDto[];
  allTypes: TenantTypeDto[];
  allEntities: EntitySimple[];
  onToggle: (typeId: string, entityId: string) => void;
  disabled: boolean;
}
export default function TenantTypeEntitiesMatrix({ items, allTypes, allEntities, onToggle, disabled }: Props) {
  const { t } = useTranslation();
  function getHeaders() {
    const headers: RowHeaderDisplayDto<EntitySimple>[] = [];
    headers.push({
      name: "entity",
      title: "Entity",
      className: "w-full",
      value: (item) => t(item.title),
    });
    allTypes.forEach((type) => {
      headers.push({
        name: type.title,
        title: "In " + (type?.titlePlural || "Default"),
        align: "center",
        value: (entity) => {
          let existing: TenantTypeEntityDto | undefined;
          if (!type.id) {
            existing = items.find((f) => f.entityId === entity.id && !f.tenantTypeId);
          } else {
            existing = items.find((f) => f.entityId === entity.id && f.tenantTypeId === type.id);
          }
          return (
            <div className="flex justify-center">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onToggle(type.id ?? "null", entity.id)}
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  existing?.enabled ? "bg-green-100 text-green-500" : "bg-gray-100 text-gray-500",
                  !disabled && existing && "hover:bg-green-200 hover:text-green-600",
                  !disabled && !existing && "hover:bg-gray-200 hover:text-gray-600",
                  disabled && "cursor-not-allowed"
                )}
              >
                {disabled ? (
                  <LockClosedIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <Fragment>{existing?.enabled ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-gray-500" />}</Fragment>
                )}
              </button>
            </div>
          );
        },
      });
    });
    return headers;
  }
  return (
    <div>
      <TableSimple items={allEntities} headers={getHeaders()} />
    </div>
  );
}
