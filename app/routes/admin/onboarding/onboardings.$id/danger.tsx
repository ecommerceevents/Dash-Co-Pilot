import { Tenant } from "@prisma/client";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useSubmit, useLoaderData, useActionData } from "@remix-run/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ServerError from "~/components/ui/errors/ServerError";
import InputGroup from "~/components/ui/forms/InputGroup";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTranslations } from "~/locale/i18next.server";
import { OnboardingWithDetails, getOnboarding, deleteOnboarding } from "~/modules/onboarding/db/onboarding.db.server";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getAllRolesNames } from "~/utils/db/permissions/roles.db.server";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { UserWithNames, adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
type LoaderData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetails;
  metadata: {
    users: UserWithNames[];
    tenants: Tenant[];
    subscriptionProducts: SubscriptionProductDto[];
    roles: { id: string; name: string }[];
  };
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const item = await getOnboarding(params.id!);
  if (!item) {
    return redirect("/admin/onboarding/onboardings");
  }
  const metadata = {
    users: await adminGetAllUsersNames(),
    tenants: await adminGetAllTenants(),
    subscriptionProducts: await getAllSubscriptionProducts(),
    roles: await getAllRolesNames(),
  };
  const data: LoaderData = {
    meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
    item,
    metadata,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  const item = await getOnboarding(params.id!);
  if (!item) {
    return redirect("/admin/onboarding/onboardings");
  }
  if (action === "delete") {
    await deleteOnboarding(item.id);
    return redirect("/admin/onboarding/onboardings");
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const appOrAdminData = useAppOrAdminData();

  const submit = useSubmit();

  const modalConfirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    modalConfirmDelete.current?.show(
      t("onboarding.prompts.deleteOnboarding.title"),
      t("shared.confirm"),
      t("shared.back"),
      t("onboarding.prompts.deleteOnboarding.description")
    );
  }
  function onConfirmDelete() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      {data.item.active && <ErrorBanner title={t("shared.warning")} text="You cannot delete an active onboarding." />}

      <InputGroup title={t("shared.dangerZone")} className="bg-red-50">
        <ButtonSecondary disabled={data.item.active || !getUserHasPermission(appOrAdminData, "admin.onboarding.delete")} destructive onClick={onDelete}>
          {t("shared.delete")}
        </ButtonSecondary>
      </InputGroup>

      <ConfirmModal ref={modalConfirmDelete} onYes={onConfirmDelete} />
      <ActionResultModal actionData={actionData} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
