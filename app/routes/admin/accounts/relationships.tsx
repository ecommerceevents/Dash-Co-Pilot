import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { adminGetAllTenantsIdsAndNames, TenantSimple } from "~/utils/db/tenants.db.server";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import InputFilters from "~/components/ui/input/InputFilters";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { useTypedLoaderData } from "remix-typedjson";
import { Link, useActionData, useNavigate, useOutlet, useSubmit } from "@remix-run/react";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
import { getAllTenantTypes } from "~/utils/db/tenants/tenantTypes.db.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import {
  deleteTenantRelationship,
  getAllTenantRelationshipsWithPagination,
  TenantRelationshipWithDetails,
} from "~/utils/db/tenants/tenantRelationships.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import DateUtils from "~/utils/shared/DateUtils";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { useRef } from "react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { getAllTenantTypeRelationships, TenantTypeRelationshipWithDetails } from "~/utils/db/tenants/tenantTypeRelationships.db.server";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
export { serverTimingHeaders as headers };

type LoaderData = {
  title: string;
  items: TenantRelationshipWithDetails[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  tenantTypeRelationships: TenantTypeRelationshipWithDetails[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin.accounts.relationships");
  await time(verifyUserHasPermission(request, "admin.relationships.view"), "verifyUserHasPermission");
  let { t } = await time(getTranslations(request), "getTranslations");

  const filterableProperties = [
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      manual: true,
      options: (await adminGetAllTenantsIdsAndNames()).map((tenant) => {
        return {
          value: tenant.id,
          name: tenant.name,
        };
      }),
    },
    {
      name: "typeId",
      title: t("shared.type"),
      manual: true,
      options: [
        { value: "null", name: "- Default -" },
        ...(await time(getAllTenantTypes(), "getAllTenantTypes")).map((item) => {
          return {
            value: item.id,
            name: t(item.title),
          };
        }),
      ],
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await time(getAllTenantRelationshipsWithPagination(filters, currentPagination), "getAllTenantRelationshipsWithPagination");

  const data: LoaderData = {
    title: `${t("models.tenant.plural")} | ${process.env.APP_NAME}`,
    items: items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    filterableProperties,
    pagination,
    tenantTypeRelationships: await getAllTenantTypeRelationships(),
  };
  return json(data, { headers: getServerTimingHeader() });
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  const id = form.get("id")?.toString();
  if (action === "delete" && id) {
    try {
      const id = form.get("id")?.toString() ?? "";
      await deleteTenantRelationship(id);
      return json({});
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminTenantsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete(item: TenantRelationshipWithDetails) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.unlink"), t("shared.cancel"));
  }

  function confirmedDelete(item: TenantRelationshipWithDetails) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout
      title={t("models.relationship.plural")}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
          <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      {data.tenantTypeRelationships.length === 0 ? (
        <WarningBanner title={"No tenant type relationships"}>
          <div className="flex flex-col">
            <div>To enable relationships between tenants, you must first create a tenant type relationship. </div>
            <Link to="/admin/settings/accounts/types" className="font-medium underline">
              Click here to create one.
            </Link>
          </div>
        </WarningBanner>
      ) : (
        <TableSimple
          items={data.items}
          pagination={data.pagination}
          actions={[
            {
              title: t("shared.unlink"),
              onClick: (_, item) => onDelete(item),
              destructive: true,
            },
          ]}
          headers={[
            {
              name: "relationship",
              title: "Relationship",
              value: (i) => (
                <div>
                  {i.tenantTypeRelationship.fromType?.title ?? "Default"} &rarr; {i.tenantTypeRelationship.toType?.title ?? "Default"}
                </div>
              ),
            },
            {
              name: "from",
              title: t("shared.from"),
              value: (item) => <TenantItem item={item.fromTenant} />,
            },
            {
              name: "to",
              title: t("shared.to"),
              value: (item) => <TenantItem item={item.toTenant} />,
            },
            {
              name: "canCreate",
              title: "Can Create",
              className: "justify-center",
              value: (item) => (
                <div className="flex justify-center">
                  {item.tenantTypeRelationship.canCreate ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="h-5 w-5 text-gray-500" />}
                </div>
              ),
            },
            {
              name: "permissions",
              title: t("models.permission.plural"),
              value: (item) => (
                <div>
                  <ShowPayloadModalButton
                    title={`${item.tenantTypeRelationship.permissions.length} ${t("models.permission.plural")}`}
                    description={`${item.tenantTypeRelationship.permissions.length} ${t("models.permission.plural")}`}
                    payload={JSON.stringify(item.tenantTypeRelationship.permissions)}
                  />
                </div>
              ),
            },
            {
              name: "createdBy",
              title: t("shared.createdBy"),
              value: (item) => (
                <div>
                  {item.createdByUser && (
                    <span>
                      {item.createdByUser.firstName} {item.createdByUser.lastName} <span className=" text-xs text-gray-500">({item.createdByUser.email})</span>
                    </span>
                  )}
                </div>
              ),
            },
            {
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (item) => DateUtils.dateAgo(item.createdAt),
              formattedValue: (item) => (
                <div className="flex flex-col">
                  <div>{DateUtils.dateYMD(item.createdAt)}</div>
                  <div className="text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
                </div>
              ),
              className: "text-gray-400 text-xs",
              breakpoint: "sm",
              sortable: true,
            },
          ]}
        />
      )}

      <SlideOverWideEmpty
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>

      <ConfirmModal ref={confirmDelete} destructive onYes={confirmedDelete} />
      <ActionResultModal actionData={actionData} />
    </EditPageLayout>
  );
}

function TenantItem({ item }: { item: TenantSimple }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-sm truncate">
      <div className="flex items-center space-x-1 truncate font-medium text-gray-800">
        <Link to={`/admin/accounts/${item.id}`} className="hover:underline">
          {item.name}
        </Link>
        {item.deactivatedReason && <SimpleBadge title={t("shared.deactivated") + ": " + item.deactivatedReason} color={Colors.RED} />}
      </div>

      <Link
        to={"/app/" + item.slug}
        className="rounded-md border-b border-dashed text-xs text-gray-500 hover:border-dashed hover:border-gray-400 focus:bg-gray-100"
      >
        <span>/{item.slug}</span>
      </Link>
    </div>
  );
}
