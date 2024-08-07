import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { Fragment, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { toast } from "react-hot-toast";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputText from "~/components/ui/input/InputText";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SettingSection from "~/components/ui/sections/SettingSection";
import { getTranslations } from "~/locale/i18next.server";
import { PortalWithDetails, getPortalByDomain, getPortalById, updatePortal } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import DomainsServer from "~/modules/domains/services/Domains.server";
import { GetCertDto } from "~/modules/domains/dtos/GetCertDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import clsx from "clsx";
import ClipboardIcon from "~/components/ui/icons/ClipboardIcon";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import PortalServer from "~/modules/portals/services/Portal.server";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import { Colors } from "~/application/enums/shared/Colors";
import SuccessBanner from "~/components/ui/banners/SuccessBanner";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ServerError from "~/components/ui/errors/ServerError";

type LoaderData = {
  item: PortalWithDetails;
  certificate: GetCertDto | null;
  portalUrl: string;
};
export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  await DomainsServer.getConfig({ request }).catch((e) => {
    throw json({ error: e.message }, { status: 400 });
  });

  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  const certificate = await DomainsServer.getCert({ hostname: item.domain, request });
  const data: LoaderData = {
    item,
    certificate,
    portalUrl: PortalServer.getPortalUrl(item),
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
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const form = await request.formData();
  const action = form.get("action");
  if (action === "edit") {
    let domain = form.get("domain")?.toString().toLowerCase().trim().replace("http://", "").replace("https://", "");
    if (domain) {
      const existingDomain = domain ? await getPortalByDomain(domain) : null;
      if (existingDomain) {
        return json({ error: "Domain taken" }, { status: 400 });
      }
      await DomainsServer.addCert({ hostname: domain, request });
    }

    await updatePortal(item, {
      domain,
    });

    return json({ success: t("shared.saved") });
  } else if (action === "check") {
    const certificate = await DomainsServer.getCert({ hostname: item.domain, request });
    if (certificate?.configured) {
      return json({ success: "Domain verified" });
    } else {
      return json({ error: "Domain not verified" }, { status: 400 });
    }
  } else if (action === "delete") {
    await DomainsServer.delCert({ hostname: item.domain!, request });
    await updatePortal(item, {
      domain: null,
    });
    return json({ success: t("shared.deleted") });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();

  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function onDelete() {
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirm() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }

  function onCheck() {
    const form = new FormData();
    form.set("action", "check");
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout
      title={"Domain"}
      withHome={false}
      menu={[
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: "Domain",
        },
      ]}
    >
      <SettingSection title={t("models.domain.custom")} size="lg">
        <Form method="post">
          <input type="hidden" name="action" value="edit" readOnly hidden />
          <div className="space-y-2">
            {/* <div className="text-muted-foreground text-sm">You can add a domain like example.com or a subdomain like my-site.example.com.</div> */}
            <InputText
              name="domain"
              title={"Domain"}
              defaultValue={data.item.domain ?? ""}
              disabled={!!data.item.domain}
              placeholder="example.com"
              readOnly={navigation.state !== "idle"}
              hint={
                <div>
                  {data.portalUrl && data.item.domain && (
                    <Link to={data.item.domain} target="_blank" className="underline">
                      {data.item.domain}
                    </Link>
                  )}
                </div>
              }
            />
            <div className="border-border mt-3 border-t pt-3">
              <div className="flex justify-end">
                <div>
                  {!data.item.domain && <LoadingButton type="submit">{t("shared.save")}</LoadingButton>}
                  {data.item.domain && (
                    <ButtonPrimary onClick={onDelete} destructive>
                      {t("shared.remove")}
                    </ButtonPrimary>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Form>
      </SettingSection>

      {data.certificate?.records && (
        <Fragment>
          {/*Separator */}
          <div className="block">
            <div className="py-5">
              <div className="border-border border-t"></div>
            </div>
          </div>

          <SettingSection
            title={
              <div className="flex items-center space-x-2 truncate">
                <ColorBadge color={data.certificate.configured ? Colors.GREEN : Colors.YELLOW} />
                <div className="truncate">{t("models.domain.verification.title")}</div>
              </div>
            }
            size="lg"
          >
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">{t("models.domain.verification.description")}</div>
              {data.certificate.records.A && (
                <div className="flex items-center space-x-2">
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordName")} type="A" value={data.certificate.records.A.name} />
                  </div>
                  <div className="px-2 pt-5 font-medium">&rarr;</div>
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordValue")} value={data.certificate.records.A.value} />
                  </div>
                </div>
              )}
              {data.certificate.records.AAAA && (
                <div className="flex items-center space-x-2">
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordName")} type="AAAA" value={data.certificate.records.AAAA.name} />
                  </div>
                  <div className="px-2 pt-5 font-medium">&rarr;</div>
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordValue")} value={data.certificate.records.AAAA.value} />
                  </div>
                </div>
              )}
              {data.certificate.records.CNAME && (
                <div className="flex items-center space-x-2">
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordName")} type="CNAME" value={data.certificate.records.CNAME.name} />
                  </div>
                  <div className="px-2 pt-5 font-medium">&rarr;</div>
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordValue")} value={data.certificate.records.CNAME.value} />
                  </div>
                </div>
              )}

              {!data.certificate.configured ? (
                <div className="border-border mt-3 space-y-2 border-t pt-3">
                  <WarningBanner title={t("models.domain.notVerified.title")}>
                    <ButtonSecondary onClick={onCheck}>{t("models.domain.notVerified.description")}</ButtonSecondary>
                  </WarningBanner>
                  <div className="flex justify-end">
                    <ButtonSecondary onClick={onCheck}>{t("models.domain.notVerified.cta")}</ButtonSecondary>
                  </div>
                </div>
              ) : (
                <SuccessBanner title={t("models.domain.verified.title")}>
                  <div>{t("models.domain.verified.description")}</div>
                  <Link to={data.portalUrl} target="_blank" className="underline">
                    {t("models.domain.verified.cta")}
                  </Link>
                </SuccessBanner>
              )}
            </div>
          </SettingSection>
        </Fragment>
      )}

      {/* <div>{JSON.stringify(data.certificate)}</div> */}

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}

function RecordInput({ title, type, value }: { title: string; type?: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-900">{title}</label>
      <div className="mt-1 flex overflow-hidden rounded-md border border-gray-300">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          {type && (
            <div className="absolute inset-y-0 left-0 flex w-16 items-center justify-center border-r bg-gray-100 pl-3 pr-4 text-xs font-medium text-gray-600">
              {type}
            </div>
          )}
          <input
            className={clsx("block w-full rounded-none rounded-l-md border-0 py-2 text-xs text-gray-900 focus:outline-none", type && "pl-20")}
            value={value}
            readOnly
          />
        </div>
        <button
          type="button"
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md border-l border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          }}
        >
          <ClipboardIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
