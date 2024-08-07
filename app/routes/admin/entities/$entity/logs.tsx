import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import LogsTable from "~/components/app/events/LogsTable";
import { getTranslations } from "~/locale/i18next.server";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getAllRowLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

type LoaderData = {
  items: LogWithDetails[];
  pagination: PaginationDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!item) {
    return redirect("/admin/entities");
  }
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await getAllRowLogs({ entityId: item.id, pagination: currentPagination });
  const data: LoaderData = {
    items,
    pagination,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  return badRequest({ error: t("shared.invalidForm") });
};

export default function EditEntityIndexRoute() {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div>
      <LogsTable withTenant={true} items={data.items} pagination={data.pagination} />
    </div>
  );
}
