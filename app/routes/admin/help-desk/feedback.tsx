import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { getTranslations } from "~/locale/i18next.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { FeedbackWithDetails, getAllFeedback } from "~/modules/helpDesk/db/feedback.db.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import FeedbackServer from "~/modules/helpDesk/services/Feedback.server";
import FeedbackTable from "~/modules/helpDesk/components/FeedbackTable";
import { useTranslation } from "react-i18next";

type LoaderData = {
  items: FeedbackWithDetails[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "tenantId",
      title: "models.tenant.object",
      options: [
        { value: "null", name: "{null}" },
        ...(await adminGetAllTenantsIdsAndNames()).map((item) => {
          return {
            value: item.id,
            name: item.name,
          };
        }),
      ],
    },
    {
      name: "userId",
      title: "models.user.object",
      options: [
        { value: "null", name: "{null}" },
        ...(await adminGetAllUsersNames()).map((item) => {
          return {
            value: item.id,
            name: item.email,
          };
        }),
      ],
    },
  ];
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await getAllFeedback({ filters, filterableProperties, pagination: currentPagination });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  if (form.get("action") === "delete") {
    const ids = (form.get("ids")?.toString().split(",") ?? []).map((x) => x.toString() ?? "");
    await FeedbackServer.deleteMany({ ids });
    return json({ success: true });
  } else {
    return json({ error: t("shared.invalidForm"), success: false }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <EditPageLayout title={t("feedback.plural")}>
      <FeedbackTable data={data} />
    </EditPageLayout>
  );
}
