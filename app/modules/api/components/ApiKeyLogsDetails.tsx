import { useSubmit, useSearchParams, useNavigation, useParams } from "@remix-run/react";
import { useState } from "react";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import RefreshIcon from "~/components/ui/icons/RefreshIcon";
import InputFilters from "~/components/ui/input/InputFilters";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import { FilterableValueLink } from "~/components/ui/links/FilterableValueLink";
import TableSimple from "~/components/ui/tables/TableSimple";
import ApiUtils from "~/utils/app/ApiUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import DateUtils from "~/utils/shared/DateUtils";
import NumberUtils from "~/utils/shared/NumberUtils";
import { ApiKeyLogDto } from "../dtos/ApiKeyLogDto";
import ApiCallSpeedBadge from "./ApiCallSpeedBadge";
import { useTranslation } from "react-i18next";
import ApiCallStatusBadge from "./ApiCallStatusBadge";

interface Props {
  data: {
    items: ApiKeyLogDto[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
  };
}
export default function ApiKeyLogsDetails({ data }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const params = useParams();

  const canDelete = !params.tenant;

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedRows, setSelectedRows] = useState<ApiKeyLogDto[]>([]);
  function onDelete(ids: string[]) {
    if (!canDelete) {
      return;
    }
    const form = new FormData();
    form.set("action", "delete");
    form.set("ids", ids.join(","));
    submit(form, {
      method: "post",
    });
  }
  return (
    <div className="space-y-2">
      <div className="flex w-full items-center space-x-2">
        <div className="flex-grow">
          <InputSearchWithURL />
        </div>
        {canDelete && selectedRows.length > 0 && (
          <ButtonSecondary
            destructive
            disabled={!getUserHasPermission(appOrAdminData, "admin.apiKeys.delete")}
            onClick={() => {
              onDelete(selectedRows.map((x) => x.id));
              setSelectedRows([]);
            }}
          >
            Delete {selectedRows.length}
          </ButtonSecondary>
        )}
        <ButtonSecondary onClick={() => setSearchParams(searchParams)} isLoading={navigation.state === "loading"}>
          <RefreshIcon className="h-4 w-4" />
        </ButtonSecondary>
        <InputFilters filters={data.filterableProperties} />
      </div>
      <TableSimple
        selectedRows={canDelete ? selectedRows : undefined}
        onSelected={canDelete ? setSelectedRows : undefined}
        items={data.items}
        pagination={data.pagination}
        actions={[
          {
            title: t("shared.delete"),
            onClick: (_, item) => onDelete([item.id]),
            hidden: () => !canDelete,
            disabled: () => !canDelete,
            destructive: true,
          },
        ]}
        headers={[
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateYMDHMS(item.createdAt),
            formattedValue: (item) => <div className="text-xs text-gray-600">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>,
          },
          {
            name: "tenant",
            title: "Tenant",
            value: (item) => <FilterableValueLink name="tenantId" value={item.apiKey?.tenant?.name} param={item.apiKey?.tenant?.id} />,
            hidden: !!params.tenant,
          },
          {
            name: "apiKeyId",
            title: t("models.apiKey.alias"),
            value: (item) => <FilterableValueLink name="apiKeyId" value={item.apiKey?.alias ?? "{null}"} param={item.apiKeyId ?? "{null}"} />,
          },
          {
            name: "ip",
            title: t("models.apiKeyLog.ip"),
            value: (item) => item.ip,
            formattedValue: (item) => (
              <div>{item.ip.length > 0 ? <FilterableValueLink name="ip" value={item.ip} /> : <span className="text-gray-300">?</span>}</div>
            ),
          },
          {
            name: "endpoint",
            title: t("models.apiKeyLog.endpoint"),
            value: (item) => <FilterableValueLink name="endpoint" value={item.endpoint} />,
          },
          {
            name: "method",
            title: t("models.apiKeyLog.method"),
            value: (item) => item.method,
            formattedValue: (item) => (
              <div>
                <FilterableValueLink name="method" value={item.method}>
                  <SimpleBadge title={item.method} color={ApiUtils.getMethodColor(item.method)} underline />
                </FilterableValueLink>
              </div>
            ),
          },
          {
            name: "status",
            title: t("models.apiKeyLog.status"),
            value: (item) => item.status,
            formattedValue: (item) => (
              <div>
                {item.status ? (
                  <span>
                    <FilterableValueLink name="status" value={item.status.toString()}>
                      <ApiCallStatusBadge item={item} underline />
                    </FilterableValueLink>
                  </span>
                ) : (
                  <span className="text-gray-300">?</span>
                )}
              </div>
            ),
          },
          {
            name: "duration",
            title: "Duration",
            value: (item) =>
              item.duration === null ? (
                <span className="text-xs italic text-gray-500">-</span>
              ) : (
                <div>{NumberUtils.custom(Number(item.duration), "0,0.001")} ms</div>
              ),
          },
          {
            name: "speed",
            title: "Speed",
            value: (item) =>
              item.duration === null ? <span className="text-xs italic text-gray-500">-</span> : <ApiCallSpeedBadge duration={Number(item.duration)} />,
          },
          {
            name: "params",
            title: t("models.apiKeyLog.params"),
            value: (item) =>
              item.params === "{}" ? (
                <span className="text-xs italic text-gray-500">-</span>
              ) : (
                <ShowPayloadModalButton description={item.params} payload={item.params} />
              ),
          },
          {
            name: "error",
            title: "Error",
            value: (item) => <div className="text-red-500">{item.error}</div>,
          },
        ]}
      />
    </div>
  );
}
