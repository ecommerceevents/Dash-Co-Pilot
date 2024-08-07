import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useNavigate, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputText from "~/components/ui/input/InputText";
import { getTranslations } from "~/locale/i18next.server";
import { deletePortalUser, getPortalUserById, updatePortalUser } from "~/modules/portals/db/portalUsers.db.server";
import { getPortalById } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { toast } from "sonner";
import { PortalUserDto } from "~/modules/portals/dtos/PortalUserDto";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  user: PortalUserDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  const user = await getPortalUserById(portal.id, params.userId!);
  if (!user) {
    return redirect(UrlUtils.getModulePath(params, `portals/${params.portal}/users`));
  }
  const data: LoaderData = {
    user,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const user = await getPortalUserById(portal.id, params.userId!);
  if (!user) {
    return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/users`));
  }

  if (action === "edit") {
    const firstName = form.get("firstName")?.toString();
    const lastName = form.get("lastName")?.toString();
    const avatar = form.get("avatar")?.toString();

    await updatePortalUser(user.id, {
      firstName,
      lastName,
      avatar,
    });

    return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/users`));
  } else if (action === "delete") {
    try {
      await deletePortalUser(portal.id, user.id);
      return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/users`));
    } catch (e: any) {
      return json({ error: e }, { status: 400 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();
  const params = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const confirmDelete = useRef<RefConfirmModal>(null);

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

  return (
    <div>
      <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value="edit" hidden readOnly />

        <div className="space-y-2">
          <InputText autoFocus type="email" name="email" title={t("models.user.email")} disabled defaultValue={data.user.email} />

          <InputText name="firstName" title={t("models.user.firstName")} defaultValue={data.user.firstName} />

          <InputText name="lastName" title={t("models.user.lastName")} defaultValue={data.user.lastName ?? ""} />
        </div>
        <div className="mt-5 flex justify-between space-x-2">
          <div>
            <ButtonSecondary onClick={onDelete} destructive>
              {t("shared.delete")}
            </ButtonSecondary>
          </div>
          <div className="flex justify-between space-x-2">
            <ButtonSecondary type="button" className="w-full" onClick={() => navigate(UrlUtils.getModulePath(params, `portals/${params.portal}/users`))}>
              <div className="w-full text-center">{t("shared.back")}</div>
            </ButtonSecondary>
            <LoadingButton type="submit" disabled={navigation.state === "submitting"} className="w-full">
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </Form>

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </div>
  );
}
