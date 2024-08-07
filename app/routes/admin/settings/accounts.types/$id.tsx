import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { TenantTypeForm } from "~/components/core/tenants/types/TenantTypeForm";
import { getTranslations } from "~/locale/i18next.server";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { TenantTypeWithDetails, getTenantType, updateTenantType, deleteTenantType, getTenantTypeByTitle } from "~/utils/db/tenants/tenantTypes.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  item: TenantTypeWithDetails;
  allSubscriptionProducts: SubscriptionProductDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.accountTypes.update");
  const item = await getTenantType(params.id!);
  if (!item) {
    return redirect("/admin/settings/accounts/types");
  }
  const data: LoaderData = {
    item,
    allSubscriptionProducts: await getAllSubscriptionProducts(),
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const item = await getTenantType(params.id!);
  if (!item) {
    return redirect("/admin/settings/accounts/types");
  }

  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.accountTypes.update");
    const title = form.get("title")?.toString().trim();
    const titlePlural = form.get("titlePlural")?.toString().trim();
    const description = form.get("description")?.toString() || null;
    const isDefault = Boolean(form.get("isDefault"));
    const subscriptionProducts = form.getAll("subscriptionProducts[]").map((f) => f.toString());

    if (!title || !titlePlural) {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }

    const existing = await getTenantTypeByTitle(title);
    if (existing && existing.id !== item.id) {
      return json({ error: t("shared.alreadyExists") }, { status: 400 });
    }

    await updateTenantType(params.id!, {
      title,
      titlePlural,
      description,
      isDefault,
      subscriptionProducts,
    });
    return redirect("/admin/settings/accounts/types");
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.accountTypes.delete");
    await deleteTenantType(params.id!);
    return json({ success: t("shared.deleted") });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();

  return (
    <div>
      <TenantTypeForm item={data.item} allSubscriptionProducts={data.allSubscriptionProducts} />
    </div>
  );
}
