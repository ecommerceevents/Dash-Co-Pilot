import { Group } from "@prisma/client";
import ColorBadge from "~/components/ui/badges/ColorBadge";

interface Props {
  item: Group;
}
export default function GroupBadge({ item }: Props) {
  return (
    <div className="flex items-center space-x-2">
      <ColorBadge color={item.color} />
      <div>{item.name}</div>
    </div>
  );
}
