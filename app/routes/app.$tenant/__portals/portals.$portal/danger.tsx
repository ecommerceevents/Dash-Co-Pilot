import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { toast } from "react-hot-toast";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SettingSection from "~/components/ui/sections/SettingSection";
import { getTranslations } from "~/locale/i18next.server";
import { getPortalUsers } from "~/modules/portals/db/portalUsers.db.server";
import { PortalWithDetails, deletePortal, getPortalById } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import PortalServer from "~/modules/portals/services/Portal.server";
import { getAllPortalSubscriptionProducts } from "~/modules/portals/db/portalSubscriptionProducts.db.server";
import InputText from "~/components/ui/input/InputText";

type LoaderData = {
  item: PortalWithDetails & { portalUrl?: string };
};
export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const item: (PortalWithDetails & { portalUrl?: string }) | null = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  item.portalUrl = PortalServer.getPortalUrl(item);
  const data: LoaderData = {
    item,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export let action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);

  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return json({ error: t("shared.notFound") }, { status: 404 });
  }

  const form = await request.formData();
  const action = form.get("action");
  if (action === "delete") {
    const users = await getPortalUsers(item.id);
    const products = await getAllPortalSubscriptionProducts(item.id);
    if (users.length > 0) {
      return json({ error: "Cannot delete portal with users." }, { status: 400 });
    }
    if (products.length > 0) {
      return json({ error: "Cannot delete portal with products." }, { status: 400 });
    }
    await deletePortal(item.id);
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [typeToConfirm, setTypeToConfirm] = useState<string>("");

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function onDelete() {
    confirmDelete.current?.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirm() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }

  const textToType = `${t("shared.delete")} ${data.item.subdomain}`;
  return (
    <EditPageLayout
      title={t("shared.danger")}
      withHome={false}
      menu={[
        // {
        //   title: t("models.portal.plural"),
        //   routePath: UrlUtils.getModulePath(params, "portals"),
        // },
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: t("shared.settings"),
        },
      ]}
    >
      <div className="pb-10">
        <SettingSection title={t("shared.dangerZone")} description={t("shared.warningCannotUndo")}>
          <div className="mt-12 space-y-2 md:col-span-2 md:mt-0">
            <div>
              <InputText title={`Type "${textToType}" to confirm`} value={typeToConfirm} setValue={setTypeToConfirm} />
            </div>
            <div>
              <ButtonPrimary disabled={typeToConfirm !== textToType} destructive={true} onClick={onDelete}>
                {t("shared.delete")}
              </ButtonPrimary>
            </div>
          </div>
        </SettingSection>

        <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
      </div>
    </EditPageLayout>
  );
}
