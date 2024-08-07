import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useTypedActionData } from "remix-typedjson";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import RowForm from "~/components/entities/rows/RowForm";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { RowsNewBlockDto } from "./RowsNewBlockUtils";

export default function RowsNewVariantForm({ item }: { item: RowsNewBlockDto }) {
  const actionData = useTypedActionData<{ saveAndAdd?: boolean; newRow?: RowWithDetails }>();
  return (
    <>
      {item.data && (
        <>
          <NewPageLayout title={""}>
            {actionData?.newRow ? (
              <RowCreated entityData={item.data.entityData} newRow={actionData?.newRow} />
            ) : (
              <CheckPlanFeatureLimit item={item.data.entityData.featureUsageEntity}>
                <RowForm
                  entity={item.data.entityData.entity}
                  routes={undefined}
                  onCreatedRedirect={item.data.entityData.entity.onCreated ?? undefined}
                  allEntities={item.data.allEntities}
                  hiddenFields={{
                    "rows-action": "create",
                    "rows-entity": item.variables.entityName.value,
                    "rows-tenant": item.variables.tenantId.value,
                    "rows-redirectTo": item.variables.redirectTo.value,
                  }}
                  relationshipRows={item.data.relationshipRows}
                  hiddenProperties={item.hiddenProperties}
                />
              </CheckPlanFeatureLimit>
            )}
          </NewPageLayout>
        </>
      )}
    </>
  );
}

function RowCreated({ entityData, newRow }: { entityData: EntitiesApi.GetEntityData; newRow: RowWithDetails }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 pb-6 pt-3 sm:px-6 lg:px-8">
      <div className="text-sm font-medium text-gray-800">{t("shared.created")}</div>
      <div className="group relative mt-2 w-full rounded-md border-2 border-dashed border-gray-300 bg-white text-left text-sm">
        <div className="grid grid-cols-2 gap-2 px-4 py-3">
          {entityData.entity.properties.filter((f) => f.isDisplay).length === 0 ? (
            <div>{RowHelper.getTextDescription({ entity: entityData.entity, item: newRow, t })}</div>
          ) : (
            <>
              <div className={clsx("font-medium text-gray-700")}>
                <div className="flex flex-col">
                  <div className="text-xs uppercase text-gray-400">ID</div>
                  <div>{newRow.id}</div>
                </div>
              </div>
              {entityData.entity.properties
                .filter((f) => f.isDisplay)
                .sort((a, b) => a.order - b.order)
                .map((property, idx) => (
                  <div key={property.id} className="text-gray-500">
                    <div className="flex flex-col">
                      <div className="text-xs uppercase text-gray-400">{t(property.title)}</div>
                      <div>{RowHelper.getCellValue({ entity: entityData.entity, property, item: newRow })}</div>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-end space-x-2">
        <Link
          to="."
          className="border-theme-200 bg-theme-100 text-theme-700 hover:bg-theme-200 focus:ring-theme-500 inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium leading-4 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          {t("shared.addAnother")}
        </Link>
      </div>
    </div>
  );
}
