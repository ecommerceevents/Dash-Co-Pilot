import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useNavigate, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { RefInputText } from "~/components/ui/input/InputText";
import { getTranslations } from "~/locale/i18next.server";
import { getPortalById } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { toast } from "sonner";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { createPortalPage, deletePortalPage, getPortalPagesByName, updatePortalPage } from "~/modules/portals/db/portalPages.db.server";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { PortalPageConfigDto } from "~/utils/db/appPortalConfiguration.db.server";
import { Portal, PortalPage } from "@prisma/client";
import JsonPropertiesUtils from "~/modules/jsonProperties/utils/JsonPropertiesUtils";
import { JsonPropertiesValuesDto } from "~/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import JsonPropertyValuesInput from "~/modules/jsonProperties/components/JsonPropertyValuesInput";
import PortalServer from "~/modules/portals/services/Portal.server";

type LoaderData = {
  portal: Portal;
  pageConfig: PortalPageConfigDto;
  page: PortalPage | null;
  portalUrl: string;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  const page = await getPortalPagesByName(portal.id, params.name!);
  const appConfiguration = await getAppConfiguration({ request });
  const pageConfig = appConfiguration.portals.pages.find((p) => p.name === params.name);
  // const page = existing;
  if (!pageConfig) {
    return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pages`));
  }
  const data: LoaderData = {
    portal,
    pageConfig,
    page,
    portalUrl: PortalServer.getPortalUrl(portal),
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
  const page = await getPortalPagesByName(portal.id, params.name!);
  const appConfiguration = await getAppConfiguration({ request });
  const pageConfig = appConfiguration.portals.pages.find((p) => p.name === params.name);
  if (!pageConfig) {
    return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pages`));
  }

  if (action === "edit") {
    const attributes = JsonPropertiesUtils.getValuesFromForm({
      form,
      properties: pageConfig.properties,
    });

    if (!page) {
      await createPortalPage({
        portalId: portal.id,
        name: params.name!,
        attributes,
      });
    } else {
      await updatePortalPage(page.id, {
        attributes,
      });
    }
    return json({ success: t("shared.updated") });
    // return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pages`));
  } else if (action === "delete") {
    try {
      if (page) {
        await deletePortalPage(page.id);
      }
      return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pages`));
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

  const [attributes] = useState<JsonPropertiesValuesDto>((data.page?.attributes ?? {}) as JsonPropertiesValuesDto);

  const confirmDelete = useRef<RefConfirmModal>(null);
  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
      mainInput.current?.input.current?.select();
    }, 100);
  }, []);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success, {
        action: {
          label: t("shared.preview"),
          onClick: () => {
            const href = `${data.portalUrl}${data.pageConfig.slug}`;
            window.open(href, "_blank");
          },
        },
      });
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div>
        {/* <h1 className="text-2xl font-semibold">
          {t("models.portal.pages.object")}: {data.pageConfig.title}
        </h1> */}
        <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
          <input type="hidden" name="action" value="edit" hidden readOnly />

          <div className="space-y-2">
            {/* {JSON.stringify(attributes)} */}
            <JsonPropertyValuesInput prefix="attributes" properties={data.pageConfig.properties} attributes={attributes} />
            {/* <InputText ref={mainInput} autoFocus name="title" title={"Title"} defaultValue={data.page?.title} required />

          <InputText name="description" title={"Description"} defaultValue={data.page?.description} required />

          {data.page.canUpdateContent && <ContentForm name={data.page.name} value={content} />} */}
          </div>
          <div className="mt-5 flex justify-between space-x-2">
            <div>
              {data.page && (
                <ButtonSecondary onClick={onDelete} destructive>
                  {t("shared.reset")}
                </ButtonSecondary>
              )}
            </div>
            <div className="flex justify-between space-x-2">
              <ButtonSecondary type="button" className="w-full" onClick={() => navigate(UrlUtils.getModulePath(params, `portals/${params.portal}/pages`))}>
                <div className="w-full text-center">{t("shared.back")}</div>
              </ButtonSecondary>
              <LoadingButton type="submit" disabled={navigation.state === "submitting"} className="w-full">
                {t("shared.save")}
              </LoadingButton>
            </div>
          </div>
        </Form>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </div>
  );
}
