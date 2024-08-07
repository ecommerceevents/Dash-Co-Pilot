import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputMultiText from "~/components/ui/input/InputMultiText";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTranslations } from "~/locale/i18next.server";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { db } from "~/utils/db.server";
import { AppConfiguration, getAppConfiguration, getOrCreateAppConfiguration, updateAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  totalMetricLogs: number;
  appConfiguration: AppConfiguration;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.metrics.view");
  await getOrCreateAppConfiguration({ request });
  const data: LoaderData = {
    title: `${t("settings.admin.danger.title")} | ${process.env.APP_NAME}`,
    totalMetricLogs: await db.metricLog.count(),
    appConfiguration: await getAppConfiguration({ request }),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action: ActionFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.metrics.update");
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  if (action === "set-settings") {
    const ignoreUrls: RowValueMultipleDto[] = form.getAll("ignoreUrls[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    await updateAppConfiguration({
      metricsEnabled: ["true", "on"].includes(form.get("enabled")?.toString() ?? "false"),
      metricsLogToConsole: ["true", "on"].includes(form.get("logToConsole")?.toString() ?? "false"),
      metricsSaveToDatabase: ["true", "on"].includes(form.get("saveToDatabase")?.toString() ?? "false"),
      metricsIgnoreUrls: ignoreUrls
        .filter((f) => !!f.value)
        .map((i) => i.value)
        .sort()
        .join(","),
    });

    return json({ success: true });
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.metrics.delete");
    await db.metricLog.deleteMany({ where: {} });
    return json({ success: "Configuration reset successfully" });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const confirmModalDelete = useRef<RefConfirmModal>(null);

  const [enabled, setEnabled] = useState<boolean>(data.appConfiguration.metrics.enabled);
  const [logToConsole, setLogToConsole] = useState<boolean>(data.appConfiguration.metrics.logToConsole);
  const [saveToDatabase, setSaveToDatabase] = useState<boolean>(data.appConfiguration.metrics.saveToDatabase);
  const [ignoredUrls, setIgnoredUrls] = useState<string[]>(data.appConfiguration.metrics.ignoreUrls.sort());

  useEffect(() => {
    setEnabled(data.appConfiguration.metrics.enabled);
    setLogToConsole(data.appConfiguration.metrics.logToConsole);
    setSaveToDatabase(data.appConfiguration.metrics.saveToDatabase);
    setIgnoredUrls(data.appConfiguration.metrics.ignoreUrls.sort());
  }, [data]);

  function canUpdate() {
    return navigation.state === "idle" && getUserHasPermission(appOrAdminData, "admin.metrics.update");
  }
  function canDelete() {
    return getUserHasPermission(appOrAdminData, "admin.metrics.delete") && data.totalMetricLogs > 0;
  }
  function onDelete() {
    confirmModalDelete.current?.show("Delete metric logs", "Delete", "Cancel", "Are you sure you want to delete all metric logs?");
  }

  function onConfirmedDelete() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
    // setBlocks(data.page.blocks);
  }
  return (
    <IndexPageLayout
      title="Metrics"
      replaceTitleWithTabs={true}
      tabs={[
        {
          name: "Summary",
          routePath: "/admin/metrics/summary",
        },
        {
          name: "All logs",
          routePath: "/admin/metrics/logs",
        },
        {
          name: "Settings",
          routePath: "/admin/metrics/settings",
        },
      ]}
    >
      {/* <WarningBanner title="Warning">
        Metrics settings can only be changed by editing the <code>app/utils/db/appConfiguration.db.server.ts</code> file.
      </WarningBanner> */}
      <Form method="post" className="space-y-2 px-3">
        <input name="action" value="set-settings" hidden readOnly />
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          <div className="sm:col-span-6">
            <InputCheckboxWithDescription
              name="enabled"
              value={enabled}
              title="Enabled"
              description="Metrics are enabled"
              disabled={!canUpdate()}
              setValue={(e) => setEnabled(e)}
            />
            <InputCheckboxWithDescription
              name="logToConsole"
              value={logToConsole}
              title="Log to console"
              description="Log metrics to console"
              disabled={!canUpdate()}
              setValue={(e) => setLogToConsole(e)}
            />
            <InputCheckboxWithDescription
              name="saveToDatabase"
              value={saveToDatabase}
              title="Save to database"
              description="Save metrics to database"
              disabled={!canUpdate()}
              setValue={(e) => setSaveToDatabase(e)}
            />
            <InputMultiText
              name="ignoreUrls"
              title="Ignored URLs"
              value={ignoredUrls.map((f, idx) => {
                return {
                  order: idx,
                  value: f,
                };
              })}
              disabled={!canUpdate()}
            />
          </div>
        </div>
        <div className="border-border flex justify-between space-x-2 border-t pt-3">
          <ButtonSecondary
            destructive
            disabled={!canDelete() || (navigation.state === "submitting" && navigation.formData?.get("action") !== "delete")}
            onClick={onDelete}
          >
            {t("shared.delete")} {data.totalMetricLogs} logs
          </ButtonSecondary>
          <div className="flex items-center space-x-2">
            <LoadingButton type="submit" disabled={!canUpdate()}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
        <ActionResultModal actionData={actionData} showSuccess={false} />
        <ConfirmModal ref={confirmModalDelete} onYes={onConfirmedDelete} />
      </Form>
    </IndexPageLayout>
  );
}
