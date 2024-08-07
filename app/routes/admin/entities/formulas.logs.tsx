import { ActionFunction, LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputFilters from "~/components/ui/input/InputFilters";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { FilterableValueLink } from "~/components/ui/links/FilterableValueLink";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { FormulaLogWithDetails, getFormulaLogs } from "~/modules/formulas/db/formulaLogs.db.server";
import { getAllFormulasIdsAndNames } from "~/modules/formulas/db/formulas.db.server";
import { FormulaCalculationTriggerTypes } from "~/modules/formulas/dtos/FormulaDto";
import SpeedBadge from "~/modules/metrics/components/SpeedBadge";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { db } from "~/utils/db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  title: string;
  items: FormulaLogWithDetails[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  allEntities: EntityWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.formulas.view");
  const { t } = await getTranslations(request);

  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "formulaId",
      title: "Formula",
      options: (await getAllFormulasIdsAndNames()).map((item) => {
        return { value: item.id, name: item.name };
      }),
    },
    {
      name: "status",
      title: "Status",
      manual: true,
      options: [
        { name: "Success", value: "success" },
        { name: "Error", value: "error" },
        { name: "No result", value: "empty" },
      ],
    },
    {
      name: "originalTrigger",
      title: "Original Trigger",
      options: FormulaCalculationTriggerTypes.map((item) => ({ name: item, value: item })),
    },
    {
      name: "triggeredBy",
      title: "Triggered By",
      options: FormulaCalculationTriggerTypes.map((item) => ({ name: item, value: item })),
    },
    {
      name: "hasRowId",
      title: "Has Row",
      manual: true,
    },
    {
      name: "rowValueId",
      title: "Row value id",
    },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      options: (await adminGetAllTenantsIdsAndNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
    {
      name: "userId",
      title: t("models.user.object"),
      options: (await adminGetAllUsersNames()).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);

  const logs = await getFormulaLogs({
    id: params.id!,
    pagination: { pageSize: pagination.pageSize, page: pagination.page },
    filters,
  });
  const allEntities = await getAllEntities({ tenantId: null });
  const data: LoaderData = {
    title: `Formula Logs | ${process.env.APP_NAME}`,
    items: logs.items,
    filterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: logs.total,
      totalPages: Math.ceil(logs.total / pagination.pageSize),
    },
    allEntities,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  if (form.get("action") === "delete") {
    await verifyUserHasPermission(request, "admin.formulas.delete");
    const ids = (form.get("ids")?.toString().split(",") ?? []).map((x) => x.toString() ?? "");
    await db.formulaLog.deleteMany({
      where: { id: { in: ids } },
    });
    return json({ success: true });
  } else {
    return json({ error: t("shared.invalidForm"), success: false }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const submit = useSubmit();

  const [selectedRows, setSelectedRows] = useState<FormulaLogWithDetails[]>([]);
  function onDelete(ids: string[]) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("ids", ids.join(","));
    submit(form, {
      method: "post",
    });
  }
  return (
    <EditPageLayout
      title={``}
      menu={[
        {
          title: "Formulas",
          routePath: "/admin/entities/formulas",
        },
        {
          title: "Logs",
          routePath: "/admin/entities/formulas/logs",
        },
      ]}
    >
      <div className="space-y-2">
        <div className="flex justify-between space-x-2">
          <h2 className="text-xl font-semibold">Formula Logs</h2>
          <div className="flex items-center space-x-2">
            {selectedRows.length > 0 && (
              <ButtonSecondary
                destructive
                disabled={!getUserHasPermission(appOrAdminData, "admin.formulas.delete")}
                onClick={() => {
                  onDelete(selectedRows.map((x) => x.id));
                  setSelectedRows([]);
                }}
              >
                Delete {selectedRows.length}
              </ButtonSecondary>
            )}
            <InputFilters withSearch={false} filters={data.filterableProperties} />
          </div>
        </div>
        <TableSimple
          selectedRows={selectedRows}
          onSelected={setSelectedRows}
          pagination={data.pagination}
          items={data.items}
          headers={[
            {
              name: "formula",
              title: "Formula",
              value: (item) => item.formula.name,
            },
            {
              name: "status",
              title: "Status",
              value: (item) => (
                <div>
                  {item.error ? (
                    <FilterableValueLink name="status" value="error">
                      <SimpleBadge title="Error" color={Colors.RED} />
                    </FilterableValueLink>
                  ) : item.result.length === 0 ? (
                    <FilterableValueLink name="status" value="empty">
                      <SimpleBadge title="No result" color={Colors.YELLOW} />
                    </FilterableValueLink>
                  ) : item.result.length > 0 ? (
                    <FilterableValueLink name="status" value="success">
                      <SimpleBadge title="Success" color={Colors.GREEN} />
                    </FilterableValueLink>
                  ) : null}
                </div>
              ),
            },
            {
              name: "result",
              title: "Result",
              value: (item) => <div>{item.result}</div>,
            },
            {
              name: "originalTrigger",
              title: "Original Trigger",
              value: (item) => <FilterableValueLink name="originalTrigger" value={item.originalTrigger ?? ""} />,
            },
            {
              name: "triggeredBy",
              title: "Triggered By",
              value: (item) => <FilterableValueLink name="triggeredBy" value={item.triggeredBy} />,
            },
            {
              name: "expression",
              title: "Expression",
              value: (item) => <div>{item.expression}</div>,
            },
            {
              name: "components",
              title: "Components",
              value: (item) => (
                <ShowPayloadModalButton
                  title="Components"
                  description={item.components.length + " components"}
                  payload={JSON.stringify(
                    {
                      components: item.components
                        .sort((a, b) => a.order - b.order)
                        .map((f) => ({ order: f.order ?? undefined, type: f.type, value: f.value, rowId: f.rowId ?? undefined })),
                    },
                    null,
                    2
                  )}
                />
              ),
            },
            {
              name: "error",
              title: "Error",
              value: (item) => <div className="text-red-500">{item.error}</div>,
            },
            {
              name: "speed",
              title: "Speed",
              value: (item) => <SpeedBadge duration={item.duration} />,
            },
            {
              name: "duration",
              title: "Duration",
              value: (item) => <div>{item.duration.toFixed(3)} ms</div>,
            },
            {
              name: "usedRows",
              title: "Used Rows",
              value: (item) => (
                <div className="flex flex-col">
                  {item.components
                    .filter((f) => f.rowId)
                    .filter((f, index, self) => self.findIndex((t) => t.rowId === f.rowId) === index)
                    .map((f) => (
                      <FilterableValueLink key={f.id} name="hasRowId" value={f.rowId ?? ""} />
                    ))}
                </div>
              ),
            },
            {
              name: "rowValueId",
              title: "Row value",
              value: (item) => <FilterableValueLink name="rowValueId" value={item.rowValueId ?? ""} />,
            },
            {
              name: "tenant",
              title: "Tenant",
              value: (item) => <div>{item.tenant?.name}</div>,
            },
            {
              name: "user",
              title: "User",
              value: (item) => <div>{item.user?.email}</div>,
            },
            {
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (item) => DateUtils.dateYMDHMS(item.createdAt),
              formattedValue: (item) => <div className="text-xs text-gray-600">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>,
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
