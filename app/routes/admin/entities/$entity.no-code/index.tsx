import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Fragment, useState } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getRows, RowWithDetails } from "~/utils/db/entities/rows.db.server";
import NoCodeViewsHelper from "~/utils/helpers/NoCodeViewsHelper";

type LoaderData = {
  entity: EntityWithDetails;
  rows: RowWithDetails[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  const data: LoaderData = {
    entity,
    rows: await getRows({ entityId: entity.id, tenantId: null }),
  };
  return json(data);
};

export default function EditEntityCrudRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const [previews] = useState(NoCodeViewsHelper.getEntityPreviews(data.entity, data.rows));
  return (
    <div className="space-y-4 overflow-y-auto p-4 sm:px-8 sm:py-7">
      {previews.map((item) => {
        return (
          <div key={item.title} className="space-y-2">
            <div>
              <div className="text-lg font-bold text-gray-800">{item.title}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {item.views.map((view) => (
                <Fragment key={view.name}>
                  {!view.error ? (
                    <Link
                      to={`${view.href}`}
                      reloadDocument={view.reloadDocument}
                      className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:border-2 focus:border-gray-600 focus:bg-white focus:outline-none"
                    >
                      {view.icon}
                      <div className="block text-sm font-medium text-gray-900">
                        {view.name} {view.error && <span className="text-xs lowercase text-red-500">({view.error})</span>}
                        {view.underConstruction && <span className="text-xs lowercase text-orange-500">(Under 🚧 Construction)</span>}
                      </div>
                      <div className="block text-xs text-gray-500">{view.description}</div>
                    </Link>
                  ) : (
                    <div className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-3 text-center">
                      {view.icon}
                      <div className="block text-sm font-medium text-gray-900">
                        {view.name} {view.error && <span className="text-xs lowercase text-red-500">({view.error})</span>}
                        {view.underConstruction && <span className="text-xs lowercase text-orange-500">(Under 🚧 Construction)</span>}
                      </div>
                      <div className="block text-xs text-gray-500">{view.description}</div>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
