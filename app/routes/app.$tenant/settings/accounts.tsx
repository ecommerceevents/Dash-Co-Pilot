import { Menu } from "@headlessui/react";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useNavigate, useOutlet, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { FromTenantTypeRelationshipDto } from "~/application/dtos/tenants/FromTenantTypeRelationshipDto";
import { TenantTypeDto } from "~/application/dtos/tenants/TenantTypeDto";
import { TenantTypeRelationshipDto } from "~/application/dtos/tenants/TenantTypeRelationshipDto";
import LinkedAccountsTable from "~/components/core/linkedAccounts/LinkedAccountsTable";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import Dropdown from "~/components/ui/dropdowns/Dropdown";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import InputSearch from "~/components/ui/input/InputSearch";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { getTranslations } from "~/locale/i18next.server";
import { TenantTypesApi } from "~/utils/api/.server/TenantTypesApi";
import { TenantSimple, getTenant, updateTenantDeactivated } from "~/utils/db/tenants.db.server";
import { TenantRelationshipWithDetails, deleteTenantRelationship, getTenantRelationshipsFrom } from "~/utils/db/tenants/tenantRelationships.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";

type LoaderData = {
  metadata: MetaTagsDto;
  items: TenantRelationshipWithDetails[];
  fromTenantTypes: FromTenantTypeRelationshipDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.accounts.view", tenantId);
  const items = await getTenantRelationshipsFrom(tenantId);
  const tenant = await getTenant(tenantId);
  const fromTenantTypes = await TenantTypesApi.getRelationships({ fromTypes: tenant?.types ?? [], hasRelationship: true });
  const data: LoaderData = {
    metadata: [{ title: `${t("models.tenant.plural")} | ${process.env.APP_NAME}` }],
    items,
    fromTenantTypes,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  const form = await request.formData();
  const action = form.get("action");
  const id = form.get("id")?.toString() ?? "";
  if (action === "delete") {
    await verifyUserHasPermission(request, "app.settings.accounts.delete", tenantId);
    try {
      await deleteTenantRelationship(id);
      return json({});
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "deactivate" && id) {
    const deactivatedReason = form.get("reason")?.toString();
    if (!deactivatedReason) {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
    await updateTenantDeactivated(id, {
      active: false,
      deactivatedReason,
    });
    return json({});
  } else if (action === "activate" && id) {
    await updateTenantDeactivated(id, {
      active: true,
      deactivatedReason: null,
    });
    return json({});
  } else {
    return json({ error: t("shared.invalidAction") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metadata || [];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const submit = useSubmit();

  const [searchInput, setSearchInput] = useState("");

  const [open, setOpen] = useState(!!outlet);
  useEffect(() => {
    setOpen(!!outlet);
  }, [outlet]);

  function getCanCreateTenants() {
    const items: {
      toTypeId: string | null;
      toType: TenantTypeDto | null;
      relationship: TenantTypeRelationshipDto;
    }[] = [];
    data.fromTenantTypes.forEach((from) => {
      from.to.forEach((to) => {
        if (to.relationship.canCreate && !items.find((i) => i.toTypeId === to.toTypeId)) {
          items.push(to);
        }
      });
    });
    return items.sort((a, b) => (a.toType?.title ?? "").localeCompare(b.toType?.title ?? ""));
  }
  const confirmDelete = useRef<RefConfirmModal>(null);
  function onDelete(item: TenantRelationshipWithDetails) {
    confirmDelete.current?.setValue(item.id);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteConfirmed(id: string) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", id);
    submit(form, {
      method: "post",
    });
  }
  function onDeactivated(value: TenantSimple, reason: string, activate: boolean) {
    const form = new FormData();
    form.set("action", !activate ? "deactivate" : "activate");
    form.set("reason", reason ?? "");
    form.set("id", value.id);
    submit(form, {
      method: "post",
    });
  }
  return (
    <EditPageLayout title="Linked Accounts">
      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex-grow">
            <InputSearch value={searchInput} setValue={setSearchInput} />
          </div>
          {getCanCreateTenants().length === 1 && (
            <ButtonSecondary to={`new/${getCanCreateTenants()[0].relationship.id}`}>
              <div className="flex items-center space-x-1">
                <PlusIcon className="h-3 w-3" />
                <div>{getCanCreateTenants()[0].toType?.title ?? "Default"}</div>
              </div>
            </ButtonSecondary>
          )}
          {getCanCreateTenants().length > 1 && (
            <Dropdown
              right={false}
              button={<div>{t("shared.new")}</div>}
              options={
                <div>
                  {getCanCreateTenants().map((to) => (
                    <Menu.Item key={to.toTypeId}>
                      {({ active }) => (
                        <Link
                          to={`new/${to.relationship.id}`}
                          className={clsx("w-full text-left", active ? "bg-gray-100 text-gray-900" : "text-gray-700", "block px-4 py-2 text-sm")}
                        >
                          <div className="flex items-center space-x-1">
                            <PlusIcon className="h-3 w-3" />
                            <div>{to.toType?.title ?? "Default"}</div>
                          </div>
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              }
            ></Dropdown>
          )}
        </div>
      </div>
      <LinkedAccountsTable items={data.items} onDelete={onDelete} onDeactivated={onDeactivated} />

      <SlideOverWideEmpty
        open={open}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-md"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirmed} />
    </EditPageLayout>
  );
}
