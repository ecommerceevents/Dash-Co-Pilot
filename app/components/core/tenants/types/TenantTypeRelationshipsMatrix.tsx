import { Link } from "@remix-run/react";
import clsx from "clsx";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { FromTenantTypeRelationshipDto } from "~/application/dtos/tenants/FromTenantTypeRelationshipDto";
import { TenantTypeDto } from "~/application/dtos/tenants/TenantTypeDto";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import TableSimple from "~/components/ui/tables/TableSimple";

interface Props {
  items: FromTenantTypeRelationshipDto[];
  allTypes: TenantTypeDto[];
}
export default function TenantTypeRelationshipsMatrix({ items, allTypes }: Props) {
  function getRelationshipHeaders(): RowHeaderDisplayDto<FromTenantTypeRelationshipDto>[] {
    let headers: RowHeaderDisplayDto<FromTenantTypeRelationshipDto>[] = [];
    headers = [
      {
        name: "from",
        title: "From",
        className: "w-full",
        value: (item) => item.fromType?.title || "Default",
      },
    ];
    headers = [
      ...headers,
      ...[...allTypes].map((to) => {
        const header: RowHeaderDisplayDto<FromTenantTypeRelationshipDto> = {
          name: `to-${to?.title}`,
          title: "To " + (to?.titlePlural || "Default"),
          align: "center",
          value: (item) => {
            const relationship = item.to.find((t) => t.toTypeId === (to?.id || null))?.relationship;
            return (
              <div className="flex justify-center">
                <Link
                  to={`${item?.fromType?.id || "default"}/${to?.id || "default"}`}
                  className={clsx(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    relationship?.hasRelationship ? "bg-green-100 text-green-500" : "bg-gray-100 text-gray-500",
                    relationship?.hasRelationship && "hover:bg-green-200 hover:text-green-600",
                    !relationship?.hasRelationship && "hover:bg-gray-200 hover:text-gray-600"
                  )}
                >
                  {relationship?.hasRelationship ? (
                    <div>
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div>
                      <XIcon className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </Link>
              </div>
            );
          },
        };
        return header;
      }),
    ];
    return headers;
  }
  return <TableSimple items={items} headers={getRelationshipHeaders()} />;
}
