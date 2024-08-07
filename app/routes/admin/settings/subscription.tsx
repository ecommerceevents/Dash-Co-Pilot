import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { AppConfiguration, getAppConfiguration, getOrCreateAppConfiguration, updateAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  appConfiguration: AppConfiguration;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.account.subscription");
  const appConfiguration = await getAppConfiguration({ request });
  const data: LoaderData = {
    title: `Subscription | ${process.env.APP_NAME}`,
    appConfiguration,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  if (action === "update") {
    await verifyUserHasPermission(request, "admin.account.subscription");
    await getOrCreateAppConfiguration({ request });
    await updateAppConfiguration({
      subscriptionRequired: Boolean(form.get("required")),
      subscriptionAllowSubscribeBeforeSignUp: Boolean(form.get("allowSubscribeBeforeSignUp")),
      subscriptionAllowSignUpBeforeSubscribe: Boolean(form.get("allowSignUpBeforeSubscribe")),
    });
    return json({});
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function AdminSettingsSubscription() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();

  const [required, setRequired] = useState(data.appConfiguration.subscription.required);
  const [allowSubscribeBeforeSignUp, setAllowSubscribeBeforeSignUp] = useState(data.appConfiguration.subscription.allowSubscribeBeforeSignUp);
  const [allowSignUpBeforeSubscribe, setAllowSignUpBeforeSubscribe] = useState(data.appConfiguration.subscription.allowSignUpBeforeSubscribe);

  const [canUpdate] = useState(getUserHasPermission(adminData, "admin.account.subscription"));

  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subscription</h1>

        <Form method="post" className="divide-y-gray-200 mt-6 space-y-8 divide-y">
          <input name="action" value="update" hidden readOnly />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-6">
              <InputCheckboxWithDescription
                name="required"
                value={required}
                setValue={setRequired}
                title="Subscription required"
                description="Active subscription is required to use the application"
                disabled={!canUpdate}
              />

              <InputCheckboxWithDescription
                name="allowSubscribeBeforeSignUp"
                value={allowSubscribeBeforeSignUp}
                setValue={setAllowSubscribeBeforeSignUp}
                title="Allow subscription before sign up"
                description="Users can subscribe/buy before setting up their account"
                disabled={!canUpdate}
              />

              <InputCheckboxWithDescription
                name="allowSignUpBeforeSubscribe"
                value={allowSignUpBeforeSubscribe}
                setValue={setAllowSignUpBeforeSubscribe}
                title="Allow sign up without subscription"
                description="Users can register before subscribing/buying a plan"
                disabled={!canUpdate}
              />
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <LoadingButton
              type="submit"
              className="bg-primary hover:bg-primary/90 focus:ring-primary ml-3 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {t("shared.save")}
            </LoadingButton>
          </div>
        </Form>
      </div>
    </div>
  );
}
