import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { getTranslations } from "~/locale/i18next.server";
import { TenantTypeWithDetails, getTenantType } from "~/utils/db/tenants/tenantTypes.db.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { TenantTypesApi } from "~/utils/api/.server/TenantTypesApi";
import { TenantTypeRelationshipDto } from "~/application/dtos/tenants/TenantTypeRelationshipDto";
import { useNavigation, useParams, useSubmit } from "@remix-run/react";
import { Permission } from "@prisma/client";
import { getAllPermissions } from "~/utils/db/permissions/permissions.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputSearch from "~/components/ui/input/InputSearch";
import { useRef, useState } from "react";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import {
  createTenantTypeRelationship,
  deleteTenantTypeRelationship,
  getTenantTypeRelationship,
  updateTenantTypeRelationship,
} from "~/utils/db/tenants/tenantTypeRelationships.db.server";
import SettingSection from "~/components/ui/sections/SettingSection";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";

type LoaderData = {
  title: string;
  from: TenantTypeWithDetails | null;
  to: TenantTypeWithDetails | null;
  relationship: TenantTypeRelationshipDto | null;
  permissions: Permission[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.accountTypes.view");
  const from = await getTenantType(params.from!);
  const to = await getTenantType(params.to!);
  const relationship = await TenantTypesApi.getRelationship({ fromTypeId: from?.id || null, toTypeId: to?.id || null });
  const data: LoaderData = {
    title: `Tenant Types | ${process.env.APP_NAME}`,
    from,
    to,
    relationship: relationship.hasRelationship ? relationship : null,
    permissions: await getAllPermissions("app"),
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const from = await getTenantType(params.from!);
  const to = await getTenantType(params.to!);

  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "edit") {
    const canCreate = form.get("canCreate") === "true";
    const existing = await getTenantTypeRelationship({ fromTypeId: from?.id ?? null, toTypeId: to?.id ?? null });
    if (existing) {
      await updateTenantTypeRelationship(existing.id, {
        canCreate,
      });
    }
    return json({ success: true });
  } else if (action === "create-relationship") {
    await createTenantTypeRelationship({ fromTypeId: from?.id ?? null, toTypeId: to?.id ?? null });
    return json({ success: true });
  } else if (action === "delete-relationship") {
    const existing = await getTenantTypeRelationship({ fromTypeId: from?.id ?? null, toTypeId: to?.id ?? null });
    if (existing) {
      await deleteTenantTypeRelationship(existing.id);
    }
    return redirect(`/admin/settings/accounts/types`);
  } else if (action === "set-permission") {
    const permissionId = form.get("permission-id")?.toString() ?? "";
    const add = form.get("add") === "true";
    await TenantTypesApi.setPermission({
      fromTypeId: from?.id || null,
      toTypeId: to?.id || null,
      permission: {
        id: permissionId,
        type: add ? "add" : "remove",
      },
    });

    return json({ success: true });
  } else if (action === "set-permissions") {
    const add = form.get("add") === "true";
    const permissionIds = form.getAll("permissionIds").map((id) => id.toString());
    await TenantTypesApi.setPermissions({
      fromTypeId: from?.id || null,
      toTypeId: to?.id || null,
      type: add ? "add" : "remove",
      permissionIds,
    });

    return json({ success: true });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [searchInput, setSearchInput] = useState("");

  // function onDelete(id: string) {
  //   const form = new FormData();
  //   form.set("action", "delete");
  //   form.set("id", id);
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  function filteredItems() {
    return data.permissions.filter((p) => p.name.toLowerCase().includes(searchInput.toLowerCase()));
  }

  function getPermission(permission: Permission) {
    return data.relationship?.permissions?.find((p) => p.id === permission.id);
  }

  function hasAllSelected() {
    return filteredItems().every((p) => getPermission(p));
  }

  function onUpdate({ canCreate }: { canCreate: boolean }) {
    const form = new FormData();
    form.set("action", "edit");
    form.set("canCreate", canCreate ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  function onChange(item: Permission, add: any) {
    const form = new FormData();
    form.set("action", "set-permission");
    form.set("permission-id", item.id);
    form.set("add", add ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  function onChangeMultiple(items: Permission[], add: any) {
    const form = new FormData();
    form.set("action", "set-permissions");
    form.set("add", add ? "true" : "false");
    items.forEach((item) => {
      form.append("permissionIds", item.id);
    });
    submit(form, {
      method: "post",
    });
  }

  function onDeselectAll() {
    onChangeMultiple(filteredItems(), false);
  }

  function onCreateRelationship() {
    const form = new FormData();
    form.set("action", "create-relationship");
    submit(form, {
      method: "post",
    });
  }

  const confirmDelete = useRef<RefConfirmModal>(null);
  function onDelete() {
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteConfirmed() {
    const form = new FormData();
    form.set("action", "delete-relationship");
    submit(form, {
      method: "post",
    });
  }

  function hasRelationship() {
    return data.relationship?.hasRelationship;
  }

  return (
    <EditPageLayout
      title={`${data.from?.title || "Default"} to ${data.to?.titlePlural || "Default"}`}
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
        {
          title: `${data.from?.title || "Default"} to ${data.to?.titlePlural || "Default"}`,
          routePath: `/admin/settings/accounts/types/${params.from}/${params.to}`,
        },
      ]}
    >
      <div className="space-y-2 py-6">
        {!hasRelationship() ? (
          <button
            type="button"
            onClick={onCreateRelationship}
            className="relative block w-full rounded-lg border-2 border-dashed border-teal-300 bg-teal-50 p-4 text-center hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-teal-700">
              Enable {data.from?.title || "Default"} to {data.to?.titlePlural || "Default"} relationship
            </span>
          </button>
        ) : (
          <div className="space-y-4">
            <SettingSection title="Settings">
              <InputCheckboxInline
                name="canCreate"
                title={`${data.from?.titlePlural || "Default"} can create ${data.to?.titlePlural || "Default"}`}
                value={data.relationship?.canCreate}
                setValue={(e) => onUpdate({ canCreate: Boolean(e) })}
              />
            </SettingSection>
            <SettingSection title="Permissions">
              <div className="space-y-2">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-grow">
                    <InputSearch disabled={!hasRelationship()} value={searchInput} setValue={setSearchInput} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <ButtonSecondary disabled={!hasRelationship() || !data.relationship?.permissions?.length} onClick={onDeselectAll}>
                      {t("shared.clear")}{" "}
                      <span className="ml-1 text-xs">
                        (
                        {
                          filteredItems()
                            .map((p) => getPermission(p))
                            .filter((p) => p).length
                        }
                        )
                      </span>
                    </ButtonSecondary>
                    <ButtonSecondary
                      disabled={!hasRelationship() || hasAllSelected()}
                      onClick={() => {
                        const toSelect = filteredItems()
                          .map((p) => {
                            if (!getPermission(p)) {
                              return p;
                            }
                            return null;
                          })
                          .filter((f) => f !== null);
                        onChangeMultiple(toSelect as Permission[], true);
                      }}
                    >
                      {t("shared.selectAll")} <span className="ml-1 text-xs">({filteredItems().length})</span>
                    </ButtonSecondary>
                  </div>
                </div>
                <div className="h-72 max-h-72 overflow-y-auto">
                  <TableSimple
                    items={filteredItems()}
                    headers={[
                      {
                        name: "permission",
                        title: t("models.permission.object"),
                        value: (item) => item.name,
                      },
                      {
                        name: "enabled",
                        title: t("shared.enabled"),
                        value: (item) => (
                          <InputCheckbox
                            disabled={
                              !hasRelationship() ||
                              (navigation.formData?.get("action") === "set-permission" && navigation.formData?.get("permission-id") === item.id)
                            }
                            name={item.name}
                            value={!!getPermission(item)}
                            setValue={(e) => onChange(item, e)}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            </SettingSection>
            <SettingSection title="Danger Zone">
              <button
                type="button"
                onClick={onDelete}
                className="relative block w-full rounded-lg border-2 border-dashed border-red-300 bg-red-100 p-4 text-center hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span className="mt-2 block text-sm font-medium text-red-700">
                  Delete {data.from?.title || "Default"} to {data.to?.titlePlural || "Default"} relationship
                </span>
              </button>
            </SettingSection>
          </div>
        )}
      </div>
      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirmed} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </EditPageLayout>
  );
}
