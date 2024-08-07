import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import RowsList from "~/components/entities/rows/RowsList";
import { getTranslations } from "~/locale/i18next.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import ServerError from "~/components/ui/errors/ServerError";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getRowsWithPagination } from "~/utils/helpers/.server/RowPaginationService";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { useTypedLoaderData } from "remix-typedjson";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";

type LoaderData = {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  pagination: PaginationDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    return redirect("/admin/entities");
  }
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await getRowsWithPagination({
    entityId: entity.id,
    page: currentPagination.page,
    pageSize: currentPagination.pageSize,
    orderBy: [{ createdAt: "desc" }],
  });
  const data: LoaderData = {
    entity,
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
    <div className="space-y-3">
      <h3 className="text-sm font-medium leading-3 text-gray-800">Rows</h3>
      <RowsList
        view="table"
        entity={data.entity}
        items={data.items}
        pagination={data.pagination}
        leftHeaders={[
          {
            name: "object",
            title: "Object",
            value: (item) => (
              <div>
                <ShowPayloadModalButton title="Details" description={"Details"} payload={JSON.stringify(item)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
