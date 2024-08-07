import { useSubmit, useSearchParams, useNavigation, useParams } from "@remix-run/react";
import { useState } from "react";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import RefreshIcon from "~/components/ui/icons/RefreshIcon";
import InputFilters from "~/components/ui/input/InputFilters";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import { FilterableValueLink } from "~/components/ui/links/FilterableValueLink";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateUtils from "~/utils/shared/DateUtils";
import { useTranslation } from "react-i18next";
import { FeedbackWithDetails } from "../db/feedback.db.server";

interface Props {
  data: {
    items: FeedbackWithDetails[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
  };
}
export default function FeedbackTable({ data }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigation = useNavigation();
  const params = useParams();

  const canDelete = !params.tenant;

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedRows, setSelectedRows] = useState<FeedbackWithDetails[]>([]);
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
            onClick={() => {
              onDelete(selectedRows.map((x) => x.id));
              setSelectedRows([]);
            }}
          >
            {t("shared.delete")} {selectedRows.length}
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
            value: (item) => <FilterableValueLink name="tenantId" value={item?.tenant?.name} param={item?.tenant?.id} />,
            hidden: !!params.tenant,
          },
          {
            name: "user",
            title: t("models.user.object"),
            value: (item) => <FilterableValueLink name="userId" value={item.user?.email} param={item.user?.id} />,
          },
          {
            name: "message",
            title: t("feedback.message"),
            value: (item) => <div>{item.message}</div>,
          },
        ]}
      />
    </div>
  );
}
