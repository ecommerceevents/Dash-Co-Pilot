import { useTranslation } from "react-i18next";
import { Fragment, useEffect, useRef, useState } from "react";
import plans from "~/application/pricing/plans.server";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Outlet, useSubmit, useNavigation, Link } from "@remix-run/react";
import {
  getAllSubscriptionProducts,
  getAllSubscriptionProductsWithTenants,
  getSubscriptionProduct,
  updateSubscriptionProduct,
} from "~/utils/db/subscriptionProducts.db.server";
import { getTranslations } from "~/locale/i18next.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { createPlans, deletePlan, syncPlan } from "~/utils/services/.server/pricingService";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { useAdminData } from "~/utils/data/useAdminData";
import InputSelect from "~/components/ui/input/InputSelect";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import TableSimple from "~/components/ui/tables/TableSimple";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import toast from "react-hot-toast";
import { getPossibleBillingPeriods } from "~/utils/helpers/PricingHelper";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import clsx from "clsx";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  isStripeTest: boolean;
  items: SubscriptionProductDto[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.pricing.view");
  const { t } = await getTranslations(request);
  const data: LoaderData = {
    title: `${t("admin.pricing.title")} | ${process.env.APP_NAME}`,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    items: await getAllSubscriptionProductsWithTenants(),
  };

  if (data.items.length === 0) {
    data.items = plans;
  }

  return json(data);
};

export type PricingPlansActionData = {
  error?: string;
  success?: string;
  items?: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
};
const badRequest = (data: PricingPlansActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "create-all-plans") {
    const model = Number(form.get("model")) as PricingModel;
    const items = await getAllSubscriptionProducts();
    if (items.length > 0) {
      return json({
        items,
      });
    }

    await Promise.all(
      plans
        .filter((f) => f.model === model || model === PricingModel.ALL)
        .map(async (plan) => {
          plan.translatedTitle = t(plan.title);
          plan.usageBasedPrices?.forEach((usageBasedPrice) => {
            usageBasedPrice.unitTitle = t(usageBasedPrice.unitTitle);
            usageBasedPrice.unitTitlePlural = t(usageBasedPrice.unitTitlePlural);
          });
        })
    );

    try {
      await createPlans(plans.filter((f) => f.model === model || model === PricingModel.ALL));
      await createAdminLog(request, "Created pricing plans", plans.map((f) => t(f.title)).join(", "));

      return json({
        items: await getAllSubscriptionProducts(),
      });
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "sync-plan-with-payment-provider") {
    const id = form.get("id")?.toString() ?? "";
    const item = await getSubscriptionProduct(id);
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      item.translatedTitle = t(item.title);
      await syncPlan(
        item,
        item.prices.map((price) => {
          return {
            id: price.id,
            billingPeriod: price.billingPeriod,
            currency: price.currency,
            price: Number(price.price),
          };
        })
      );
      return json({
        items: await getAllSubscriptionProducts(),
      });
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  } else if (action === "toggle") {
    const id = form.get("id")?.toString() ?? "";
    const item = await getSubscriptionProduct(id);
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      await updateSubscriptionProduct(id, {
        public: !item.public,
      });
      return json({ success: `Plan is now ${!item.public ? "public" : "private"}` });
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  } else if (action === "bulk-delete") {
    await verifyUserHasPermission(request, "admin.pricing.delete");
    const ids = form.getAll("ids[]");
    const items = await getAllSubscriptionProducts();
    const itemsToDelete = items.filter((f) => ids.includes(f.id?.toString() ?? ""));
    await Promise.all(
      itemsToDelete.map(async (item) => {
        // eslint-disable-next-line no-console
        console.log({ item: item.title, tenantProducts: item.tenantProducts?.map((f) => f.tenantSubscriptionId) });
        if (item.tenantProducts && item.tenantProducts.length > 0) {
          throw new Error("Cannot delete a plan with active subscriptions: " + t(item.title));
        }
        await createAdminLog(request, "Deleted pricing plan", item.id!);
      })
    );
    await Promise.all(
      itemsToDelete.map(async (item) => {
        await deletePlan(item);
      })
    );
    return json({ success: "Deleted" });
  }
};

export default function AdminPricingRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<PricingPlansActionData>();
  const adminData = useAdminData();
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const [selectedItems, setSelectedItems] = useState<SubscriptionProductDto[]>([]);

  const [model, setModel] = useState<PricingModel>(PricingModel.FLAT_RATE);
  const [items, setItems] = useState<SubscriptionProductDto[]>([]);
  const [, setAllFeatures] = useState<SubscriptionFeatureDto[]>([]);

  useEffect(() => {
    updateItems(data.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.items, model]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
    if (actionData?.success) {
      toast.success(actionData.success);
    }
    updateItems(actionData?.items ?? data.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function updateItems(items: SubscriptionProductDto[]) {
    if (items.filter((f) => f.id).length > 0) {
      setItems(items);
    } else {
      setItems(items.filter((f) => f.model === model || model === PricingModel.ALL));
    }
  }

  useEffect(() => {
    const allFeatures: SubscriptionFeatureDto[] = [];
    items.forEach((item) => {
      item.features.forEach((feature) => {
        const existing = allFeatures.find((f) => f.name === feature.name);
        if (!existing) {
          allFeatures.push({
            order: feature.order,
            name: feature.name,
            title: feature.title,
            type: feature.type,
            value: feature.value,
            accumulate: feature.accumulate,
          });
        }
      });
    });
    setAllFeatures(allFeatures.sort((a, b) => a.order - b.order));
  }, [items]);

  // const sortedItems = () => {
  //   return items.sort((x, y) => {
  //     return x?.order > y?.order ? 1 : -1;
  //   });
  // };

  function createAllPlans() {
    const form = new FormData();
    form.set("action", "create-all-plans");
    form.set("model", model.toString());
    submit(form, {
      method: "post",
    });
  }
  // function syncPlanWithPaymentProvider(item: SubscriptionProductDto) {
  //   const form = new FormData();
  //   form.set("action", "sync-plan-with-payment-provider");
  //   form.set("id", item.id?.toString() ?? "");
  //   submit(form, {
  //     method: "post",
  //   });
  // }
  // function createPlan(item: SubscriptionProductDto) {
  //   const form = new FormData();
  //   form.set("action", "create");
  //   form.set("order", item.order);
  //   form.set("order", item.description);
  //   employees.forEach((item) => {
  //     form.append("employees[]", JSON.stringify(item));
  //   });
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  function createdPlans() {
    return data.items.filter((f) => f.id).length;
  }

  // function getFeatureValue(item: SubscriptionProductDto, name: string) {
  //   return item.features.find((f) => f.name === name);
  // }

  function onToggle(item: SubscriptionProductDto) {
    const form = new FormData();
    form.set("action", "toggle");
    form.set("id", item.id?.toString() ?? "");
    submit(form, {
      method: "post",
    });
  }

  function getSubscriptionsRatio(item: SubscriptionProductDto) {
    const all = item.tenantProducts ?? [];
    const today = new Date();
    const active = all.filter((f) => {
      if (f.endsAt) {
        return new Date(f.endsAt) > today;
      }
      return true;
    });
    return active.length + "/" + all.length;
  }

  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex justify-between space-x-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("admin.pricing.title")}</h1>
          <Form method="post" className="flex h-9 items-center space-x-2">
            {selectedItems.length > 0 && (
              <DeleteIconButton
                items={selectedItems}
                onClick={() => {
                  const form = new FormData();
                  form.set("action", "bulk-delete");
                  selectedItems.forEach((item) => {
                    form.append("ids[]", item.id?.toString() ?? "");
                  });
                  submit(form, {
                    method: "post",
                  });
                }}
              />
            )}
            <ButtonSecondary disabled={data.items.length === 0} to={`/admin/settings/pricing/features?` + selectedItems.map((f) => "id=" + f.id).join("&")}>
              {selectedItems.length === 0 ? (
                <span>Set features</span>
              ) : (
                <span>Set features for {selectedItems.length === 1 ? "plan" : selectedItems.length + " plans"}</span>
              )}
            </ButtonSecondary>
            {selectedItems.length === 0 && (
              <Fragment>
                <ButtonSecondary disabled={loading} to="/pricing" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <div>{t("shared.preview")}</div>
                </ButtonSecondary>
                {/* <ButtonSecondary disabled={loading} to=".">
              {t("shared.reload")}
            </ButtonSecondary> */}

                <ButtonPrimary to="new" disabled={loading || !getUserHasPermission(adminData, "admin.pricing.create")}>
                  {t("shared.new")}
                </ButtonPrimary>
              </Fragment>
            )}
          </Form>
        </div>

        {createdPlans() === 0 && (
          <WarningBanner title={t("shared.warning")} text={t("admin.pricing.thesePricesAreFromFiles")}>
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-44">
                <InputSelect
                  name="model"
                  title={t("models.subscriptionProduct.model")}
                  withLabel={false}
                  value={model}
                  setValue={(e) => {
                    setModel(Number(e));
                  }}
                  options={[
                    {
                      name: t("pricing." + PricingModel[PricingModel.FLAT_RATE]),
                      value: PricingModel.FLAT_RATE,
                    },
                    {
                      name: t("pricing." + PricingModel[PricingModel.PER_SEAT]),
                      value: PricingModel.PER_SEAT,
                    },
                    {
                      name: t("pricing." + PricingModel[PricingModel.USAGE_BASED]),
                      value: PricingModel.USAGE_BASED,
                    },
                    {
                      name: t("pricing." + PricingModel[PricingModel.FLAT_RATE_USAGE_BASED]),
                      value: PricingModel.FLAT_RATE_USAGE_BASED,
                    },
                    {
                      name: t("pricing." + PricingModel[PricingModel.ONCE]),
                      value: PricingModel.ONCE,
                    },
                    {
                      name: t("shared.all"),
                      value: PricingModel.ALL,
                    },
                  ]}
                />
              </div>
              <ButtonSecondary
                type="button"
                onClick={createAllPlans}
                disabled={loading || createdPlans() > 0 || !getUserHasPermission(adminData, "admin.pricing.create")}
                className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400"
              >
                {t("admin.pricing.generateFromFiles")}
              </ButtonSecondary>
            </div>
          </WarningBanner>
        )}

        <TableSimple
          selectedRows={selectedItems}
          onSelected={(items) => setSelectedItems(items)}
          items={items}
          headers={[
            {
              name: "level",
              title: t("models.subscriptionProduct.level"),
              value: (i) => <div className="text-xs text-gray-400">{i.order}</div>,
            },
            {
              name: "title",
              title: t("models.subscriptionProduct.title"),
              value: (item) => (
                <div className="flex max-w-xs flex-col truncate">
                  <Link to={"edit/" + item.id} className="font-medium hover:underline">
                    {/* <span className="text-xs text-gray-500">#{item.order}</span> */}
                    {t(item.title)}{" "}
                    {item.badge && (
                      <span className=" border-theme-200 bg-theme-50 text-theme-800 ml-1 rounded-md border px-1 py-0.5 text-xs">{t(item.badge)}</span>
                    )}
                  </Link>
                  <div className="truncate text-xs text-gray-500">{t(item.description ?? "")}</div>
                </div>
              ),
            },
            {
              name: "model",
              title: t("models.subscriptionProduct.model"),
              value: (item) => (
                <div className="flex flex-col">
                  <div>{t("pricing." + PricingModel[item.model])} </div>
                  {item.model !== PricingModel.ONCE && (
                    <div className="text-xs text-gray-500">
                      {getPossibleBillingPeriods(item.prices)
                        .map((billingPeriod) => t("pricing." + SubscriptionBillingPeriod[billingPeriod]).toLowerCase())
                        .join(", ")}
                    </div>
                  )}
                </div>
              ),
            },
            // ...allFeatures.map((feature) => {
            //   return {
            //     name: feature.name,
            //     title: feature.name,
            //     value: (item: SubscriptionProductDto) => <PlanFeatureValue item={getFeatureValue(item, feature.name)} />,
            //   };
            // }),
            {
              name: "subscriptions",
              title: t("models.subscriptionProduct.plural"),
              value: (item) => (
                <Link to={`/admin/accounts/subscriptions?pageSize=100&subscriptionProductId=${item.id}`} className="lowercase text-gray-500 hover:underline">
                  {getSubscriptionsRatio(item)} {t("shared.active")}
                </Link>
              ),
            },
            {
              name: "active",
              title: t("models.subscriptionProduct.status"),
              value: (item) => (
                <>
                  {item.active ? (
                    <>
                      <button type="button" onClick={() => onToggle(item)} className="hover:underline">
                        {item.public ? (
                          <SimpleBadge title={t("models.subscriptionProduct.public")} color={Colors.TEAL} underline />
                        ) : (
                          <SimpleBadge title={t("models.subscriptionProduct.custom")} color={Colors.ORANGE} underline />
                        )}
                      </button>
                    </>
                  ) : (
                    <SimpleBadge title={t("shared.inactive")} color={Colors.RED} />
                  )}
                </>
              ),
            },
            {
              name: "actions",
              title: t("shared.actions"),
              value: (item) => (
                <div className="flex items-center space-x-2">
                  <ButtonTertiary disabled={!item.id} to={"/pricing?plan=" + item.id} target="_blank">
                    {t("shared.preview")}
                  </ButtonTertiary>
                  <ButtonTertiary disabled={!item.id} to={"edit/" + item.id}>
                    {t("shared.edit")}
                  </ButtonTertiary>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Outlet />
    </div>
  );
}

function DeleteIconButton({ onClick, items }: { onClick: () => void; items: SubscriptionProductDto[] }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const confirmModal = useRef<RefConfirmModal>(null);
  function onDeleting() {
    const hasWithSub = items.some((f) => (f.tenantProducts?.length ?? 0) > 0);
    if (hasWithSub) {
      toast.error("You cannot delete a plan with active subscriptions: " + items.map((f) => t(f.title ?? "")).join(", "));
    } else {
      confirmModal.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
    }
  }
  return (
    <Fragment>
      <button
        type="button"
        className={clsx(
          "group flex items-center rounded-md border border-transparent px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
          navigation.state === "submitting" && navigation.formData?.get("action") === "bulk-delete" && "base-spinner"
        )}
        disabled={navigation.state !== "idle"}
        onClick={onDeleting}
      >
        <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
      </button>
      <ConfirmModal ref={confirmModal} onYes={onClick} destructive />
    </Fragment>
  );
}
