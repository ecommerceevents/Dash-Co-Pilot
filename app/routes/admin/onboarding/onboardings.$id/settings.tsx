import { Tenant } from "@prisma/client";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useSubmit, Form, useActionData } from "@remix-run/react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import ServerError from "~/components/ui/errors/ServerError";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getTranslations } from "~/locale/i18next.server";
import { OnboardingWithDetails, getOnboarding, updateOnboarding, deleteOnboarding } from "~/modules/onboarding/db/onboarding.db.server";
import { OnboardingFilterDto } from "~/modules/onboarding/dtos/OnboardingFilterDto";
import { OnboardingFilterType, OnboardingFilterTypes } from "~/modules/onboarding/dtos/OnboardingFilterTypes";
import SessionFilterModal from "~/modules/shared/components/SessionFilterModal";
import { getAllRolesNames } from "~/utils/db/permissions/roles.db.server";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { UserWithNames, adminGetAllUsersNames } from "~/utils/db/users.db.server";

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
  if (action === "update") {
    const title = form.get("title")?.toString();
    const type = form.get("type")?.toString();
    const active = form.get("active");
    await updateOnboarding(item.id, {
      title: title !== undefined ? title : undefined,
      type: type !== undefined ? (type as "modal" | "page") : undefined,
      active: active !== undefined ? Boolean(active) : undefined,
    });
    return json({ success: "Onboarding updated" });
  } else if (action === "delete") {
    await deleteOnboarding(item.id);
    return redirect("/admin/onboarding/onboardings");
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const submit = useSubmit();

  const [showFilterModal, setShowFilterModal] = useState<{ item?: OnboardingFilterDto; idx?: number }>();

  const [title, setTitle] = useState(data.item.title);
  const [type, setType] = useState(data.item.type);
  const [filters, setFilters] = useState<OnboardingFilterDto[]>(
    data.item.filters.map((f) => {
      return {
        type: f.type as OnboardingFilterDto["type"],
        value: f.value,
      };
    })
  );

  // const modalConfirm = useRef<RefConfirmModal>(null);
  const modalConfirmDelete = useRef<RefConfirmModal>(null);

  // function activate() {
  //   modalConfirm.current?.show(t("onboarding.prompts.activate.title"), t("shared.confirm"), t("shared.back"), t("onboarding.prompts.activate.description"));
  // }

  // function onConfirmActivate() {
  //   const form = new FormData();
  //   form.set("action", "activate");
  //   submit(form, {
  //     method: "post",
  //   });
  // }

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

  function onSaveFilter(item: { type: OnboardingFilterType; value: string | null }) {
    const idx = showFilterModal?.idx;
    if (idx !== undefined) {
      filters[idx] = item;
    } else {
      filters.push(item);
    }
    setFilters([...filters]);
    setShowFilterModal(undefined);
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      <InputGroup title={t("shared.details")}>
        <Form method="post" className="divide-y-gray-200 space-y-4 divide-y">
          <input name="action" value="update" hidden readOnly />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-3">
              <InputText name="title" title={t("onboarding.object.title")} value={title} setValue={setTitle} />
            </div>
            <div className="sm:col-span-3">
              <InputSelector
                name="type"
                title={t("onboarding.object.type")}
                value={type}
                withSearch={false}
                options={[
                  { value: "modal", name: "Modal" },
                  { value: "page", name: "Page" },
                ]}
                setValue={(e) => setType(e?.toString() ?? "")}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <LoadingButton actionName="update" type="submit">
              {t("shared.save")}
            </LoadingButton>
          </div>
        </Form>
      </InputGroup>

      <InputGroup title={t("onboarding.object.filters")}>
        <Form method="post" className="space-y-2">
          <input name="action" value="set-filters" hidden readOnly />
          {filters.map((filter, index) => {
            return <input type="hidden" name="filters[]" value={JSON.stringify(filter)} key={index} hidden readOnly />;
          })}

          <p className="text-sm text-gray-600">Filters are used to determine if the onboarding should be shown to the user.</p>

          <div className="space-y-2">
            {filters.map((filter, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setShowFilterModal({ item: filter, idx })}
                  className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="flex items-center space-x-1">
                    <div className="font-medium">{filter.type}</div>
                    <div className="italic">{filter.value === null ? <span className="text-red-500">null</span> : filter.value}</div>
                  </div>
                </button>
              );
            })}

            <div className="">
              <button
                type="button"
                onClick={() => setShowFilterModal({ item: undefined, idx: undefined })}
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="block text-sm font-medium text-gray-900">Add filter</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <LoadingButton actionName="set-filters" type="submit">
              {t("shared.save")}
            </LoadingButton>
          </div>

          <SessionFilterModal
            filters={OnboardingFilterTypes.map((f) => f.toString())}
            open={showFilterModal !== undefined}
            item={showFilterModal?.item}
            idx={showFilterModal?.idx}
            onClose={() => setShowFilterModal(undefined)}
            onSave={({ type, value }) => onSaveFilter({ type: type as OnboardingFilterType, value })}
            metadata={data.metadata}
            onRemove={(idx) => {
              filters.splice(idx, 1);
              setFilters([...filters]);
            }}
          />
        </Form>
      </InputGroup>

      <InputGroup title={t("shared.dangerZone")} className="bg-red-50">
        <ButtonSecondary destructive onClick={onDelete}>
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
