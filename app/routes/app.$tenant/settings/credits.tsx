import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { useTranslation } from "react-i18next";
import CreditsList from "~/modules/usage/components/CreditsList";
import { CreditWithDetails, getAllCredits } from "~/modules/usage/db/credits.db.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { CreditTypes } from "~/modules/usage/dtos/CreditType";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  items: CreditWithDetails[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  canDelete: boolean;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  if (CreditTypes.length === 0) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings/subscription"));
  }
  const filterableProperties: FilterablePropertyDto[] = [
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
    {
      name: "type",
      title: "models.credit.type",
      options: CreditTypes.map((item) => {
        return {
          value: item.value,
          name: item.name,
        };
      }),
    },
  ];
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await getAllCredits({ tenantId, filters, filterableProperties, pagination: currentPagination });
  const data: LoaderData = {
    items,
    filterableProperties,
    pagination,
    canDelete: false,
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <EditPageLayout title={t("models.credit.plural")}>
      <CreditsList data={data} />
    </EditPageLayout>
  );
}
