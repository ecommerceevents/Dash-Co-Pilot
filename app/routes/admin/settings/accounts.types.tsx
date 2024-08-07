import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Link, useNavigate, useOutlet, useParams, useSubmit } from "@remix-run/react";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { getAllTenantTypes, deleteTenantType } from "~/utils/db/tenants/tenantTypes.db.server";
import { FromTenantTypeRelationshipDto } from "~/application/dtos/tenants/FromTenantTypeRelationshipDto";
import XIcon from "~/components/ui/icons/XIcon";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { TenantTypesApi } from "~/utils/api/.server/TenantTypesApi";
import { TenantTypeDto } from "~/application/dtos/tenants/TenantTypeDto";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { getAllTenantsWithoutTypes } from "~/utils/db/tenants.db.server";
import clsx from "clsx";
import { TenantTypeEntityDto } from "~/application/dtos/tenants/TenantTypeEntityDto";
import TenantTypeEntitiesMatrix from "~/components/core/tenants/types/TenantTypeEntitiesMatrix";
import { EntitySimple } from "~/utils/db/entities/entities.db.server";
import { createTenantTypeEntity, deleteTenantTypeEntity, getTenantTypeEntity } from "~/utils/db/tenants/tenantTypeEntities.db.server";
import TenantTypeRelationshipsMatrix from "~/components/core/tenants/types/TenantTypeRelationshipsMatrix";
import { Fragment, useEffect, useState } from "react";
import { TenantEntitiesApi } from "~/utils/api/.server/TenantEntitiesApi";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import SettingSection from "~/components/ui/sections/SettingSection";
import LockClosedIcon from "~/components/ui/icons/LockClosedIcon";

type LoaderData = {
  title: string;
  types: TenantTypeDto[];
  relationships: FromTenantTypeRelationshipDto[];
  tenantTypeEntities: TenantTypeEntityDto[];
  allEntities: EntitySimple[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.accountTypes.view");
  const types: TenantTypeDto[] = await getAllTenantTypes();
  const relationships = await TenantTypesApi.getRelationships({});
  const subscriptionProducts = await getAllSubscriptionProducts();
  const allTenants = await getAllTenantsWithoutTypes();
  types.unshift({
    title: "Default",
    titlePlural: "Default",
    description: null,
    isDefault: true,
    subscriptionProducts: subscriptionProducts
      .filter((f) => !f.assignsTenantTypes || f.assignsTenantTypes?.length === 0)
      .map((f) => ({ id: f.id, title: f.title })),
    _count: { tenants: allTenants.length },
  });

  const { allEntities, tenantTypeEntities } = await TenantEntitiesApi.getEntities({ tenantId: null });
  const data: LoaderData = {
    title: `Tenant Types | ${process.env.APP_NAME}`,
    types,
    relationships,
    tenantTypeEntities,
    allEntities,
  };
  return json(data);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "toggle-entity") {
    let tenantTypeId: string | null = form.get("typeId")?.toString() ?? "";
    if (tenantTypeId === "null") {
      tenantTypeId = null;
    }
    const entityId = form.get("entityId")?.toString() ?? "";
    const existing = await getTenantTypeEntity({ tenantTypeId, entityId });

    if (!existing) {
      await createTenantTypeEntity({
        tenantTypeId,
        entityId,
        enabled: true,
      });
    } else {
      await deleteTenantTypeEntity({ tenantTypeId, entityId });
    }
    return json({});
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.accountTypes.delete");
    const id = form.get("id")?.toString() ?? "";
    await deleteTenantType(id);
    return json({ success: t("shared.deleted") });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  // const navigation = useNavigation();
  const submit = useSubmit();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const params = useParams();

  const [open, setOpen] = useState(!!outlet);
  useEffect(() => {
    setOpen(!!outlet);
  }, [outlet]);

  function onToggleTypeEntity(typeId: string, entityId: string) {
    const form = new FormData();
    form.set("action", "toggle-entity");
    form.set("typeId", typeId);
    form.set("entityId", entityId);
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout
      title="Account Types"
      withHome={false}
      menu={[
        {
          title: "Accounts Settings",
          routePath: "/admin/settings/accounts",
        },
        {
          title: "Types",
          routePath: "/admin/settings/accounts/types",
        },
      ]}
    >
      <div>
        <WarningBanner title="Warning" text="Creating, updating, or deleting tenant/account types will override default behavior around entities." />
      </div>

      <SettingSection title="Types" className="p-1">
        <div className="space-y-2">
          <TableSimple
            items={data.types}
            headers={[
              {
                name: "name",
                title: t("shared.title"),
                value: (item) => (
                  <div className={clsx("flex max-w-xs flex-col truncate", item.id && "cursor-pointer hover:underline")}>
                    <div className="flex items-center space-x-2">
                      {!item.id && <LockClosedIcon className="h-4 w-4 text-gray-400" />}
                      <div>
                        {item.title} <span className="text-xs font-normal text-gray-500">({item.titlePlural})</span>
                      </div>
                    </div>
                    <div className="truncate text-sm text-gray-500">{item.description}</div>
                  </div>
                ),
                href: (item) => item.id ?? undefined,
                className: "w-full",
              },
              {
                name: "inProducts",
                title: "Plans",
                value: (item) => item.subscriptionProducts?.map((f) => t(f.title)).join(", ") || "-",
              },
              {
                name: "inTenants",
                title: "Accounts",
                value: (item) => item._count?.tenants,
                href(item) {
                  return "/admin/accounts?typeId=" + item.id || "null";
                },
              },
              {
                name: "isDefault",
                title: t("shared.default"),
                value: (item) => (item.isDefault ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-gray-500" />),
              },
              {
                name: "actions",
                title: "",
                value: (item) => (
                  <Fragment>
                    {item.id && (
                      <Link to={item.id} className="hover:underline">
                        {t("shared.edit")}
                      </Link>
                    )}
                  </Fragment>
                ),
              },
            ]}
          />
          <div className="flex justify-between">
            <Link
              to="new"
              className="flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium uppercase">{t("shared.add")}</span>
            </Link>
          </div>
        </div>
      </SettingSection>

      <div className="block">
        <div className="py-5">
          <div className="border-border border-t"></div>{" "}
        </div>
      </div>

      <SettingSection title="Relationships" className="">
        <TenantTypeRelationshipsMatrix items={data.relationships} allTypes={data.types} />
      </SettingSection>

      <div className="block">
        <div className="py-5">
          <div className="border-border border-t"></div>{" "}
        </div>
      </div>

      <SettingSection title="Entities" className="">
        <TenantTypeEntitiesMatrix
          items={data.tenantTypeEntities}
          allTypes={data.types}
          allEntities={data.allEntities}
          onToggle={onToggleTypeEntity}
          disabled={data.types.length <= 1}
        />
      </SettingSection>

      <SlideOverWideEmpty
        title={params.id ? "Edit Tenant Type" : "New Tenant Type"}
        open={open}
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
    </EditPageLayout>
  );
}
