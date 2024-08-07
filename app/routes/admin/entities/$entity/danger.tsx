import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData } from "remix-typedjson";
import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { deleteEntity, EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { countRows, deleteRows } from "~/utils/db/entities/rows.db.server";
import { deleteEntityPermissions } from "~/utils/db/permissions/permissions.db.server";
import { getUserRoles } from "~/utils/db/permissions/userRoles.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  entity: EntityWithDetails;
  count: number;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  const data: LoaderData = {
    entity,
    count: await countRows({ entityId: entity.id }),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user?.admin) {
    const userRoles = await getUserRoles(userInfo.userId);
    if (!userRoles.find((f) => f.role.name === DefaultAdminRoles.SuperAdmin)) {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  }
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  const form = await request.formData();
  const action = form.get("action");
  if (action === "delete-all-rows") {
    await deleteRows(entity.id);
    return json({ success: t("shared.deleted") });
  } else if (action === "delete") {
    try {
      const count = await countRows({ entityId: entity.id });
      if (count > 0) {
        return json({ error: `Entity ${entity.name} cannot be deleted because it has ${count} rows` }, { status: 400 });
      }
      await deleteEntityPermissions(entity);
      await deleteEntity(entity.id ?? "");
      return redirect("/admin/entities");
    } catch (error: any) {
      return json({ error: error.message }, { status: 400 });
    }
  }
  return json({ error: t("shared.invalidForm") }, { status: 400 });
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const adminData = useAdminData();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete(action: string) {
    confirmDelete.current?.setValue(action);
    let title = t("shared.delete");
    let button = t("shared.delete");
    if (action === "delete") {
      title = `Delete ${t(data.entity.title)} entity`;
      button = `Delete ${t(data.entity.title)} entity`;
    } else {
      title = `Delete ${t(data.entity.title)} rows (${data.count})`;
      button = `Delete ${t(data.entity.title)} rows (${data.count})`;
    }
    confirmDelete.current?.show(title, button, t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirmed(action: string) {
    const form = new FormData();
    form.set("action", action);
    submit(form, {
      method: "post",
    });
  }

  function canDelete() {
    return !adminData.isSuperAdmin || !getUserHasPermission(adminData, "admin.entities.delete");
  }
  return (
    <div className="space-y-3">
      <div className="md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">Danger</h3>
        </div>
        <p className="pt-2 text-sm text-red-900">These actions cannot be undone.</p>
      </div>

      <div className="flex items-center space-x-2">
        <ButtonPrimary disabled={canDelete() || data.count > 0} destructive onClick={() => onDelete("delete")}>
          Delete {data.entity.title} entity
        </ButtonPrimary>

        <ButtonPrimary disabled={canDelete() || data.count === 0} destructive onClick={() => onDelete("delete-all-rows")}>
          Delete {data.count} rows (SuperAdmin only)
        </ButtonPrimary>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirmed} destructive />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}
