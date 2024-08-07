import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { TenantTypeForm } from "~/components/core/tenants/types/TenantTypeForm";
import { getTranslations } from "~/locale/i18next.server";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { createTenantType, getTenantTypeByTitle } from "~/utils/db/tenants/tenantTypes.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  allSubscriptionProducts: SubscriptionProductDto[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.app.features.tenantTypes) {
    throw Error("Tenant Types are not enabled (appConfiguration.app.features.tenantTypes)");
  }
  const data: LoaderData = {
    allSubscriptionProducts: await getAllSubscriptionProducts(),
  };
  return json(data);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "create") {
    await verifyUserHasPermission(request, "admin.accountTypes.create");
    const title = form.get("title")?.toString().trim();
    const titlePlural = form.get("titlePlural")?.toString().trim();
    const description = form.get("description")?.toString() || null;
    const isDefault = Boolean(form.get("isDefault"));
    const subscriptionProducts = form.getAll("subscriptionProducts[]").map((f) => f.toString());

    if (!title || !titlePlural) {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
    const existing = await getTenantTypeByTitle(title);
    if (existing) {
      return json({ error: t("shared.alreadyExists") }, { status: 400 });
    }
    await createTenantType({
      title,
      titlePlural,
      description,
      isDefault,
      subscriptionProducts,
    });
    return redirect("/admin/settings/accounts/types");
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div>
      <TenantTypeForm allSubscriptionProducts={data.allSubscriptionProducts} />
    </div>
  );
}
