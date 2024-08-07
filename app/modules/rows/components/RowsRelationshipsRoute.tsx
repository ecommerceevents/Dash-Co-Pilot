import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import Kanban from "~/components/ui/lists/Kanban";
import UnderConstruction from "~/components/ui/misc/UnderConstruction";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import RowHelper from "~/utils/helpers/RowHelper";
import { Rows_Relationships } from "../routes/Rows_Relationships.server";

export default function RowsRelationshipsRoute() {
  // const { t } = useTranslation();
  const data = useTypedLoaderData<Rows_Relationships.LoaderData>();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="flex overflow-hidden overflow-x-auto">
        {data.entitiesData.map((data, idx) => (
          <EntityRowsRelationships className="w-64" key={idx} data={data.rowsData} />
        ))}
      </div>
      <UnderConstruction title="TODO: Relationship Views" description="Use case: Click Company to view its Contacts or Opportunities" />
    </div>
  );
}

function EntityRowsRelationships({ data, className }: { data: RowsApi.GetRowsData; className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={clsx(className)}>
      {data?.entity && (
        <Kanban
          // withTitle={withTitle}
          columns={[
            {
              name: "entity",
              title: t(data?.entity.titlePlural ?? ""),
              items: data?.items ?? [],
              card: (item) => (
                <div className="group w-full truncate rounded-md border border-gray-300 bg-white p-3 text-left shadow-sm hover:bg-gray-50">
                  <div className="flex items-center justify-between space-x-2">
                    <button
                      className="flex-grow truncate text-left"
                      type="button"
                      // onClick={() => {
                      //   if (isSelected(item)) {
                      //     const rows = searchParams.getAll(`${entity}[id]`).filter((id) => id !== item.id);
                      //     searchParams.delete(`${entity}[id]`);
                      //     for (const row of rows) searchParams.append(`${entity}[id]`, row);
                      //   } else {
                      //     searchParams.append(`${entity}[id]`, item.id);
                      //   }
                      //   setSearchParams(searchParams);
                      // }}
                    >
                      <div>{RowHelper.getTextDescription({ entity: data.entity!, item, t })}</div>
                    </button>
                    {/* <div className="w-4 flex-shrink-0">{isSelected(item) ? <CheckIcon className="h-4 w-4 text-gray-500" /> : null}</div> */}
                    {/* <button type="button" onClick={() => alert("edit: " + item.id)}>
                      Edit
                    </button> */}
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
