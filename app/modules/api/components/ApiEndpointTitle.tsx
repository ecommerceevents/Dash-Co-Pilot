import ApiUtils from "~/utils/app/ApiUtils";
import { ApiEndpointDto } from "../dtos/ApiEndpointDto";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";

export default function ApiEndpointTitle({ item }: { item: ApiEndpointDto }) {
  return (
    <div className="flex flex-col truncate">
      <div className="flex items-center space-x-2">
        <SimpleBadge title={item.method} color={ApiUtils.getMethodColor(item.method)} />
        <h3 className="text-sm font-bold text-gray-800">{item.route}</h3>
      </div>
      <div className="truncate text-xs italic text-gray-500">{item.description}</div>
    </div>
  );
}
