import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  entities: EntityWithDetails[];
};
export let loader: LoaderFunction = async () => {
  const data: LoaderData = {
    entities: await getAllEntities({ tenantId: null }),
  };
  return json(data);
};

export default () => {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <div className="space-y-4 overflow-y-auto p-4 sm:px-8 sm:py-7">
      {data.entities.length === 0 ? (
        <Link
          to="/admin/entities/new"
          className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:border-2 focus:border-gray-600 focus:bg-white focus:outline-none"
        >
          <div className="block text-sm font-medium text-gray-900">Create entity</div>
        </Link>
      ) : (
        <>
          <div className="text-lg font-bold text-gray-800">{t("shared.generate")}</div>
          <div className="grid grid-cols-3 gap-3">
            {data.entities.map((item) => {
              return (
                <Link
                  key={item.name}
                  to={`files/${item.name}`}
                  reloadDocument
                  className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:border-2 focus:border-gray-600 focus:bg-white focus:outline-none"
                >
                  <div className="block text-sm font-medium text-gray-900">{t(item.titlePlural)}</div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
