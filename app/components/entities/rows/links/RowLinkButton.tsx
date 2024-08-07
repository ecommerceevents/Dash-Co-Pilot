import { Link, useParams } from "@remix-run/react";
import { ExternalLinkIcon } from "lucide-react";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import EntityHelper from "~/utils/helpers/EntityHelper";

export default function RowLinkButton({ entityName, id }: { entityName: string; id: string }) {
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const entity = appOrAdminData.entities.find((f) => f.name === entityName)!;
  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      to={`${EntityHelper.getEntityRoute({ entity, params, appOrAdminData })}/${id}`}
      className="absolute right-2 top-2 z-10 hidden rounded-md border border-gray-300 bg-white p-2 opacity-80 hover:border-gray-500 hover:opacity-100 group-hover:block"
    >
      <ExternalLinkIcon className="h-4 w-4 text-gray-700" />
    </Link>
  );
}
