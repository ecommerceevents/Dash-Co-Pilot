import { Permission, Role } from "@prisma/client";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import LockClosedIcon from "~/components/ui/icons/LockClosedIcon";

interface Props {
  item: Role | Permission;
  color?: Colors;
}
export default function RoleBadge({ item, color = Colors.INDIGO }: Props) {
  return (
    <div className="flex items-center space-x-1">
      <div>{item.name}</div>
      {item.isDefault && <LockClosedIcon className="h-3 w-3 text-gray-300" />}
      {item.type === "admin" && <SimpleBadge title={"Admin"} color={color} />}
    </div>
  );
}
