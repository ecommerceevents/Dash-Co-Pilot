import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import EntityViewsTable from "~/components/entities/views/EntityViewsTable";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { EntityViewWithTenantAndUser, getAllEntityViews } from "~/utils/db/entities/entityViews.db.server";

type LoaderData = {
  entity: EntityWithDetails;
  items: EntityViewWithTenantAndUser[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  const { items } = await getAllEntityViews({
    entityId: entity.id,
    pagination: { pageSize: 1000, page: 1 },
  });

  const data: LoaderData = {
    entity,
    items,
  };
  return json(data);
};

export default function EditEntityIndexRoute() {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium leading-3 text-gray-800">Views</h3>
      <div>
        <div className="space-y-2">
          <EntityViewsTable
            items={data.items}
            onClickRoute={(i) => {
              return `/admin/entities/views/${i.id}`;
            }}
          />

          <Link
            to={`/admin/entities/views/new/${data.entity.name}`}
            className="focus:ring-accent-500 relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <PlusIcon className="mx-auto h-5 text-gray-600" />
            <span className="mt-2 block text-sm font-medium text-gray-900">Add custom view</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
