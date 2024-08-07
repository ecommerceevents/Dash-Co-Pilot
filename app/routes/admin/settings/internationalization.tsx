import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import UnderConstruction from "~/components/ui/misc/UnderConstruction";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  await verifyUserHasPermission(request, "admin.settings.internationalization.view");
  const data: LoaderData = {
    title: `${t("settings.admin.internationalization.title")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  if (action === "update") {
    await verifyUserHasPermission(request, "admin.settings.internationalization.update");
    // TODO
    return json({});
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function AdminSettingsInternationalization() {
  const { t, i18n } = useTranslation();
  // const data = useLoaderData<LoaderData>();

  // const [canUpdate] = useState(getUserHasPermission(adminData, "admin.settings.internationalization.update"));

  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("settings.admin.internationalization.title")}</h1>

        <UnderConstruction title="TODO: Internationalization (Save custom translations on the database?)" />

        <Form method="post" className="divide-y-gray-200 space-y-8 divide-y">
          <input name="action" value="update" hidden readOnly />

          {JSON.stringify(i18n)}

          {/* <div className="flex justify-end pt-8">
            <LoadingButton type="submit" disabled={!getUserHasPermission(adminData, "admin.settings.internationalization.update")}>
              {t("shared.save")}
            </LoadingButton>
          </div> */}
        </Form>
      </div>
    </div>
  );
}
