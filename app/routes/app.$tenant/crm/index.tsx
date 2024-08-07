import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Colors } from "~/application/enums/shared/Colors";
import RowsList from "~/components/entities/rows/RowsList";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import CrmService, { CrmSummaryDto } from "~/modules/crm/services/CrmService";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowDisplayDefaultProperty } from "~/utils/helpers/PropertyHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  title: string;
  summary: CrmSummaryDto;
  routes: EntitiesApi.Routes;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const data: LoaderData = {
    title: `CRM | ${process.env.APP_NAME}`,
    summary: await CrmService.getSummary(tenantId),
    routes: EntitiesApi.getNoCodeRoutes({ request, params }),
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-foreground text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <Link
          to={params.tenant ? `/app/${params.tenant}/crm/companies` : "/admin/crm/companies"}
          className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow hover:bg-gray-50"
        >
          <dt className="truncate text-xs font-medium uppercase text-gray-500">Companies</dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.companies)}</dd>
        </Link>
        <Link
          to={params.tenant ? `/app/${params.tenant}/crm/contacts` : "/admin/crm/contacts"}
          className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow hover:bg-gray-50"
        >
          <dt className="truncate text-xs font-medium uppercase text-gray-500">Contacts</dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.contacts)}</dd>
        </Link>
        <Link
          to={params.tenant ? `/app/${params.tenant}/crm/opportunities` : "/admin/crm/opportunities"}
          className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow hover:bg-gray-50"
        >
          <dt className="flex items-center space-x-2 truncate text-xs font-medium uppercase text-gray-500">
            <ColorBadge color={Colors.GREEN} />
            <div>Opportunities</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-gray-900">
            <div>${NumberUtils.numberFormat(data.summary.opportunities.value)}</div>
            <div className="text-xs font-normal lowercase text-gray-500">from {NumberUtils.intFormat(data.summary.opportunities.count)} opportunities</div>
          </dd>
        </Link>
      </dl>

      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-2">
          <h3 className="text-sm font-medium text-gray-600">Opportunities</h3>
          <Link
            to={params.tenant ? `/app/${params.tenant}/crm/opportunities/new` : `/admin/crm/opportunities/new`}
            className="rounded-full bg-gray-50 p-1 text-gray-800 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </Link>
        </div>
        <RowsList
          view="board"
          entity="opportunity"
          items={data.summary.data.openOpportunities}
          readOnly={true}
          columns={[
            { name: "name", title: "Name", visible: true },
            { name: "value", title: "Value", visible: true },
            { name: "expectedCloseDate", title: "Expected Close Date", visible: true },
            { name: RowDisplayDefaultProperty.CREATED_AT, title: t("shared.createdAt"), visible: true },
            { name: RowDisplayDefaultProperty.CREATED_BY, title: t("shared.createdBy"), visible: true },
          ]}
          routes={data.routes}
          onClickRoute={(i) => (params.tenant ? `/app/${params.tenant}/crm/opportunities/${i.id}` : `/admin/crm/opportunities/${i.id}`)}
        />
      </div>
    </div>
  );
}
