import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import SettingSection from "~/components/ui/sections/SettingSection";
import { getTranslations } from "~/locale/i18next.server";
import { db } from "~/utils/db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type ActionData = {
  deleteError?: string;
  deleteSuccess?: boolean;
};
export const action: ActionFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.featureFlags.manage");
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action");
  if (action === "delete-all") {
    await db.analyticsEvent.deleteMany({ where: { featureFlagId: { not: null } } });
    await db.featureFlag.deleteMany({});
    return json({
      deleteSuccess: true,
    });
  } else {
    return json({
      error: t("shared.invalidForm"),
    });
  }
};

export default function AdminAnalyticsOverviewRoute() {
  const { t } = useTranslation();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <IndexPageLayout>
        <div className="space-y-6 p-4 sm:px-6 lg:col-span-9 lg:px-0">
          <SettingSection title={t("featureFlags.danger.title")} description={t("featureFlags.danger.description")}>
            <div>
              <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                <p>{t("featureFlags.danger.reset.description")}</p>
              </div>
              <div className="mt-5">
                <Form method="post">
                  <input hidden readOnly name="action" value="delete-all" />
                  <ButtonPrimary destructive type="submit">
                    {t("featureFlags.danger.reset.title")}
                  </ButtonPrimary>

                  {actionData?.deleteSuccess ? (
                    <p className="py-2 text-xs text-green-500" role="alert">
                      {t("analytics.deleted")}
                    </p>
                  ) : null}

                  {actionData?.deleteError ? (
                    <p className="py-2 text-xs text-rose-500" role="alert">
                      {actionData.deleteError}
                    </p>
                  ) : null}
                </Form>
              </div>
            </div>
          </SettingSection>
        </div>
      </IndexPageLayout>
    </>
  );
}
