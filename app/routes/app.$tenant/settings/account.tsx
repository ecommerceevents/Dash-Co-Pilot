import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useAppData } from "~/utils/data/useAppData";
import { getTranslations } from "~/locale/i18next.server";
import { TenantWithDetails, getTenant, getTenantBySlug, updateTenant } from "~/utils/db/tenants.db.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import UpdateTenantDetailsForm from "~/components/core/tenants/UpdateTenantDetailsForm";
import { createLog } from "~/utils/db/logs.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useEffect, useRef } from "react";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { deleteAndCancelTenant } from "~/utils/services/tenantService";
import EventsService from "~/modules/events/services/.server/EventsService";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { getActiveTenantSubscriptions } from "~/utils/services/.server/subscriptionService";
import { useTypedLoaderData } from "remix-typedjson";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails, findEntityByName } from "~/utils/db/entities/entities.db.server";
import { storeSupabaseFile } from "~/utils/integrations/supabaseService";
import { TenantType } from "@prisma/client";
import { getAllTenantTypes } from "~/utils/db/tenants/tenantTypes.db.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SettingSection from "~/components/ui/sections/SettingSection";
import { AccountUpdatedDto } from "~/modules/events/dtos/AccountUpdatedDto";
import { AccountDeletedDto } from "~/modules/events/dtos/AccountDeletedDto";
import toast from "react-hot-toast";

type LoaderData = {
  title: string;
  tenantSettingsEntity: EntityWithDetails | null;
  tenant: TenantWithDetails;
  tenantTypes: TenantType[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.account.view", tenantId);
  const { t } = await getTranslations(request);
  const tenantSettingsEntity = await findEntityByName({ tenantId, name: "tenantSettings" });
  const tenant = await getTenant(tenantId);
  if (!tenant) {
    throw Error(t("shared.notFound"));
  }
  const data: LoaderData = {
    title: `${t("models.tenant.object")} | ${process.env.APP_NAME}`,
    tenantSettingsEntity,
    tenant,
    tenantTypes: await getAllTenantTypes(),
  };
  return json(data);
};

type ActionData = {
  updateDetailsError?: string;
  deleteError?: string;
  success?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const currentUser = await getUser(userInfo.userId);
  const tenantId = await getTenantIdFromUrl(params);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  const tenant = await getTenant(tenantId);
  if (!tenant || !currentUser) {
    return redirect("/app");
  }

  if (action === "edit") {
    await verifyUserHasPermission(request, "app.settings.account.update", tenantId);
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString().toLowerCase() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    if ((name?.length ?? 0) < 1) {
      return badRequest({
        updateDetailsError: "Account name must have at least 1 character",
      });
    }
    if (!slug || slug.length < 1) {
      return badRequest({ updateDetailsError: "Account slug must have at least 1 character" });
    }

    if (["settings"].includes(slug.toLowerCase())) {
      return badRequest({
        updateDetailsError: "Slug cannot be " + slug,
      });
    }
    if (slug.includes(" ")) {
      return badRequest({
        updateDetailsError: "Slug cannot contain white spaces",
      });
    }

    const existing = await getTenant(tenantId);
    if (!existing) {
      return badRequest({ updateDetailsError: "Tenant not found" });
    }
    await createLog(request, tenantId, "Update tenant details", JSON.stringify({ name, slug }));

    const tenantSettingsEntity = await findEntityByName({ tenantId, name: "tenantSettings" });
    if (tenantSettingsEntity) {
      try {
        await RowsApi.createCustom({
          entity: tenantSettingsEntity,
          tenantId,
          t,
          form,
          row: existing?.tenantSettingsRow?.row,
          rowCreateInput: { tenantSettingsRow: { create: { tenantId } } },
          request,
        });
      } catch (e: any) {
        return badRequest({ updateDetailsError: e.message });
      }
    }

    if (existing?.slug !== slug) {
      const existingSlug = await getTenantBySlug(slug);
      if (existingSlug) {
        return badRequest({
          updateDetailsError: "Slug already taken",
        });
      }
      let iconStored = icon ? await storeSupabaseFile({ bucket: "accounts-icons", content: icon, id: tenantId }) : icon;
      await updateTenant(existing, { name, icon: iconStored, slug });
      await EventsService.create({
        request,
        event: "account.updated",
        tenantId: tenant.id,
        userId: currentUser.id,
        data: {
          id: tenant.id,
          new: { name, slug },
          old: { name: tenant.name, slug: tenant.slug },
          user: { id: currentUser.id ?? "", email: currentUser.email },
        } satisfies AccountUpdatedDto,
      });
      return redirect(`/app/${slug}/settings/account`);
    } else {
      let iconStored = icon ? await storeSupabaseFile({ bucket: "accounts-icons", content: icon, id: tenantId }) : icon;
      await updateTenant(existing, { name, icon: iconStored, slug });
      await EventsService.create({
        request,
        event: "account.updated",
        tenantId: tenant.id,
        userId: currentUser.id,
        data: {
          id: tenant.id,
          new: { name, slug },
          old: { name: tenant.name, slug: tenant.slug },
          user: { id: currentUser.id, email: currentUser.email },
        } satisfies AccountUpdatedDto,
      });
      const actionData: ActionData = {
        success: t("settings.tenant.updated"),
      };
      return json(actionData);
    }
  } else if (action === "delete") {
    await EventsService.create({
      request,
      event: "account.deleted",
      tenantId: null,
      userId: currentUser.id,
      data: {
        tenant: { id: tenant.id, name: tenant.name },
        user: { id: currentUser.id, email: currentUser.email },
      } satisfies AccountDeletedDto,
    });
    await verifyUserHasPermission(request, "app.settings.account.delete", tenantId);
    const activeSubscriptions = await getActiveTenantSubscriptions(tenantId);
    if (activeSubscriptions && activeSubscriptions.products.find((f) => !f.cancelledAt)) {
      return badRequest({
        deleteError: "You cannot delete a tenant with active subscriptions",
      });
    }
    await deleteAndCancelTenant(tenantId);
    return redirect("/app");
  } else {
    return badRequest({ updateDetailsError: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function TenantRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const appData = useAppData();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.updateDetailsError) {
      toast.error(actionData.updateDetailsError);
    } else if (actionData?.deleteError) {
      toast.error(actionData.deleteError);
    }
  }, [actionData]);

  function deleteAccount() {
    confirmDelete.current?.show(t("settings.danger.confirmDeleteTenant"), t("shared.confirm"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function confirmDeleteTenant() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, { method: "post" });
  }

  return (
    <EditPageLayout>
      <SettingSection title={t("settings.tenant.general")} description={t("settings.tenant.generalDescription")}>
        <UpdateTenantDetailsForm
          disabled={!getUserHasPermission(appData, "app.settings.account.update")}
          tenant={data.tenant}
          tenantSettingsEntity={data.tenantSettingsEntity}
          tenantTypes={data.tenantTypes}
          options={{
            canChangeType: false,
          }}
        />
      </SettingSection>

      {/*Separator */}
      <div className="block">
        <div className="py-5">
          <div className="border-border border-t"></div>
        </div>
      </div>

      {/*Danger */}
      <SettingSection title={t("settings.danger.title")} description={t("settings.danger.description")}>
        <div className="mt-12 md:col-span-2 md:mt-0">
          <div>
            <input hidden type="text" name="action" value="deleteAccount" readOnly />
            <div className="">
              <div className="">
                {/* <h3 className="text-lg font-medium leading-6 text-foreground">Delete account</h3>
                <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                  <p>Delete organization and cancel subscriptions.</p>
                </div> */}
                <div className="">
                  <ButtonPrimary disabled={!getUserHasPermission(appData, "app.settings.account.delete")} destructive={true} onClick={deleteAccount}>
                    {t("settings.danger.deleteAccount")}
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteTenant} />
    </EditPageLayout>
  );
}
