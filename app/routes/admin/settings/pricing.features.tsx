import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Form, useSubmit } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { SubscriptionFeatureInPlansDto } from "~/application/dtos/subscriptions/SubscriptionFeatureInPlansDto";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import InputNumber from "~/components/ui/input/InputNumber";
import InputSelect from "~/components/ui/input/InputSelect";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import {
  createSubscriptionFeature,
  deleteSubscriptionFeatures,
  getAllSubscriptionProductsWithTenants,
  getSubscriptionProductsInIds,
} from "~/utils/db/subscriptionProducts.db.server";
import { v4 as uuidv4 } from "uuid";
import OrderListButtons from "~/components/ui/sort/OrderListButtons";
import InputText from "~/components/ui/input/InputText";
import PlanFeatureDescription from "~/components/core/settings/subscription/PlanFeatureDescription";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import toast from "react-hot-toast";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputCombobox from "~/components/ui/input/InputCombobox";
import PlansGrouped from "~/components/core/settings/subscription/plans/PlansGrouped";
import Modal from "~/components/ui/modals/Modal";
import { getCurrenciesAndPeriods } from "~/utils/helpers/PricingHelper";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAdminData } from "~/utils/data/useAdminData";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import { clearSubscriptionsCache } from "~/utils/services/.server/subscriptionService";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type LoaderData = {
  metatags: MetaTagsDto;
  items: SubscriptionProductDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const ids = searchParams.getAll("id");
  const items: SubscriptionProductDto[] = ids.length > 0 ? await getSubscriptionProductsInIds(ids) : await getAllSubscriptionProductsWithTenants();
  const data: LoaderData = {
    metatags: [{ title: `Pricing Features | ${process.env.APP_NAME}` }],
    items,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.pricing.update");

  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "update-features") {
    const planIds = JSON.parse(form.get("planIds")?.toString() ?? "[]") as string[];
    const plans = await getSubscriptionProductsInIds(planIds);
    if (plans.length === 0) {
      return json({ error: "No plans found" }, { status: 400 });
    }
    const featuresInPlans = JSON.parse(form.get("features")?.toString() ?? "[]") as SubscriptionFeatureInPlansDto[];
    await Promise.all(
      plans.map(async (plan) => {
        await deleteSubscriptionFeatures(plan.id ?? "");
        const features = featuresInPlans.filter((f) => f.plans.find((p) => p.id === plan.id));
        await Promise.all(
          features
            .sort((a, b) => a.order - b.order)
            .map(async ({ order, name, href, badge, plans, accumulate }) => {
              const feature = plans.find((p) => p.id === plan.id);
              if (!feature) {
                return;
              }
              return await createSubscriptionFeature(plan.id ?? "", {
                order,
                name,
                title: feature.title,
                type: feature.type,
                value: feature.value,
                href,
                badge,
                accumulate,
              });
            })
        );
      })
    );
    await clearSubscriptionsCache();
    return json({ success: "Features updated" });
  }
  return json({ error: "Invalid action" }, { status: 400 });
};

function getInitialItems(plans: SubscriptionProductDto[]) {
  const items: SubscriptionFeatureInPlansDto[] = [];
  plans.forEach((plan) => {
    plan.features.forEach((feature) => {
      if (!feature.name) {
        feature.name = feature.title;
      }
      const existing = items.find((f) => f.name === feature.name);
      if (existing) {
        existing.plans.push({
          id: plan.id!,
          title: feature.title,
          type: feature.type,
          value: feature.value,
        });
      } else {
        items.push({
          id: uuidv4(),
          ...feature,
          plans: [
            {
              id: plan.id!,
              title: feature.title,
              type: feature.type,
              value: feature.value,
            },
          ],
        });
      }
    });
  });

  plans.forEach((plan) => {
    items.forEach((feature) => {
      if (!feature.plans.find((p) => p.id === plan.id)) {
        feature.plans.push({
          id: plan.id!,
          title: "?",
          type: SubscriptionFeatureLimitType.NOT_INCLUDED,
          value: 0,
        });
      }
    });
  });

  return items;
}

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const adminData = useAdminData();
  const submit = useSubmit();

  const [showPreview, setShowPreview] = useState(false);

  const [items, setItems] = useState<SubscriptionFeatureInPlansDto[]>([]);
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<SubscriptionFeatureInPlansDto>[]>([]);

  const [selectedPlans, setSelectedPlans] = useState<SubscriptionProductDto[]>(data.items);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  useEffect(() => {
    setItems(getInitialItems(selectedPlans));
  }, [selectedPlans]);

  useEffect(() => {
    const headers: RowHeaderDisplayDto<SubscriptionFeatureInPlansDto>[] = [
      // {
      //   title: "Order",
      //   name: "feature-order",
      //   className: "w-32",
      //   value: (item) => item.order,
      //   type: InputType.NUMBER,
      //   setValue: (order, idx) =>
      //     updateItemByIdx(items, setItems, idx, {
      //       order,
      //     }),
      //   inputBorderless: false,
      // },
      {
        title: t("shared.order"),
        name: "order",
        value: (item) => item.order,
        formattedValue: (_, idx) => (
          <OrderListButtons
            index={idx}
            items={items}
            onChange={(items) => {
              setItems(items as SubscriptionFeatureInPlansDto[]);
            }}
          />
        ),
      },
      {
        title: "Title",
        name: "feature-title",
        value: (item) => (
          <ClosedOpenedValue
            closed={
              <div className="flex flex-col space-y-2 px-1 py-2">
                {/* <div className="font-medium">{t(item.title)}</div> */}
                <div className="font-bold">
                  {item.name ? (
                    <span>
                      {item.name} {item.accumulate ? <span className="text-xs font-light italic text-gray-400">(accumulates)</span> : null}
                    </span>
                  ) : (
                    <span className="text-red-600 underline">Click to set</span>
                  )}
                </div>
              </div>
            }
            opened={
              <div className="flex flex-col space-y-2 px-1 py-2">
                <div>
                  <InputText
                    name="name"
                    title="Name"
                    placeholder="Name..."
                    value={item.name}
                    required
                    setValue={(e) => {
                      item.name = e?.toString() ?? "";
                      setItems([...items]);
                    }}
                  />
                </div>
                <div>
                  <InputText
                    name="href"
                    title="URL"
                    placeholder="URL..."
                    value={item.href ?? undefined}
                    setValue={(e) => {
                      item.href = e?.toString() ?? "";
                      setItems([...items]);
                    }}
                  />
                </div>
                <div>
                  <InputText
                    name="badge"
                    title="Badge"
                    placeholder=".e.g. New!"
                    value={item.badge ?? undefined}
                    setValue={(e) => {
                      item.badge = e?.toString() ?? "";
                      setItems([...items]);
                    }}
                  />
                </div>
                <div>
                  <InputCheckboxWithDescription
                    name="accumulate"
                    title="Accumulate"
                    value={item.accumulate}
                    setValue={(e) => {
                      item.accumulate = Boolean(e);
                      setItems([...items]);
                    }}
                    description="Accumulates when user buys multiple times"
                  />
                </div>
              </div>
            }
          />
        ),
      },
      // {
      //   name: "accumulate",
      //   title: "Accumulate",
      //   value: (item) => {
      //     return item.accumulate ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-300" />
      //   }
      // },
    ];

    selectedPlans.forEach((plan) => {
      /*
      {
              title: "Type",
              name: "feature-type",
              type: InputType.SELECT,
              value: (item) => item.type,
              className: "w-32",
              options: [
                {
                  name: "Not included",
                  value: SubscriptionFeatureLimitType.NOT_INCLUDED,
                },
                {
                  name: "Included",
                  value: SubscriptionFeatureLimitType.INCLUDED,
                },
                {
                  name: "Monthly",
                  value: SubscriptionFeatureLimitType.MONTHLY,
                },
                {
                  name: "Max",
                  value: SubscriptionFeatureLimitType.MAX,
                },
                {
                  name: "Unlimited",
                  value: SubscriptionFeatureLimitType.UNLIMITED,
                },
              ],
              setValue: (type, idx) => {
                let value = items[idx].value;
                if (Number(type) !== SubscriptionFeatureLimitType.MAX && Number(type) !== SubscriptionFeatureLimitType.MONTHLY) {
                  value = 0;
                }
                updateItemByIdx(items, setItems, idx, {
                  type,
                  value,
                });
              },
              inputBorderless: false,
            },
            {
              title: "Value",
              name: "feature-value",
              type: InputType.NUMBER,
              className: "w-32",
              value: (item) => item.value,
              editable: (item) => item.type === SubscriptionFeatureLimitType.MAX || item.type === SubscriptionFeatureLimitType.MONTHLY,
              setValue: (value, idx) =>
                updateItemByIdx(items, setItems, idx, {
                  value,
                }),
              inputBorderless: false,
            },
      */

      headers.push({
        title: t(plan.title),
        name: "feature-in-" + plan.id,
        value: (item) => {
          const existing = item.plans.find((p) => p.id === plan.id);
          return (
            <ClosedOpenedValue
              closed={
                <div>
                  {!item.name || !existing || !existing.title.trim() || existing.title === "?" ? (
                    <div className="text-red-600 underline">Click to set</div>
                  ) : (
                    <PlanFeatureDescription
                      feature={{
                        ...item,
                        title: existing?.title ?? "",
                        value: existing?.value ?? 0,
                        type: existing?.type ?? SubscriptionFeatureLimitType.NOT_INCLUDED,
                      }}
                      editing={true}
                    />
                  )}
                </div>
              }
              opened={
                <div className="flex flex-col space-y-2 px-1 py-2">
                  {!existing ? (
                    <div>-</div>
                  ) : (
                    <Fragment>
                      <div>
                        <InputText
                          withTranslation={true}
                          name="title"
                          title="Title"
                          placeholder="Title..."
                          value={existing?.title}
                          required
                          setValue={(e) => {
                            existing.title = e?.toString() ?? "";
                            setItems([...items]);
                          }}
                        />
                      </div>
                      <div>
                        <InputSelect
                          name="type"
                          title="Type"
                          value={existing?.type}
                          setValue={(e) => {
                            let type = Number(e) as SubscriptionFeatureLimitType;
                            if (existing) {
                              existing.type = type;
                              if (![SubscriptionFeatureLimitType.MAX, SubscriptionFeatureLimitType.MONTHLY].includes(type)) {
                                existing.value = 0;
                              }
                            } else {
                              item.plans.push({
                                id: plan.id!,
                                title: "?",
                                type,
                                value: 0,
                              });
                            }
                            setItems([...items]);
                          }}
                          options={[
                            {
                              name: "Not included",
                              value: SubscriptionFeatureLimitType.NOT_INCLUDED,
                            },
                            {
                              name: "Included",
                              value: SubscriptionFeatureLimitType.INCLUDED,
                            },
                            {
                              name: "Monthly",
                              value: SubscriptionFeatureLimitType.MONTHLY,
                            },
                            {
                              name: "Max",
                              value: SubscriptionFeatureLimitType.MAX,
                            },
                            {
                              name: "Unlimited",
                              value: SubscriptionFeatureLimitType.UNLIMITED,
                            },
                          ]}
                        />
                      </div>
                      <div>
                        <InputNumber
                          name="value"
                          title="Limit"
                          value={existing?.value}
                          setValue={(e) => {
                            let value = e as number;
                            if (existing) {
                              existing.value = value;
                            } else {
                              item.plans.push({
                                id: plan.id!,
                                title: "?",
                                type: SubscriptionFeatureLimitType.MAX,
                                value,
                              });
                            }
                            setItems([...items]);
                          }}
                          disabled={![SubscriptionFeatureLimitType.MONTHLY, SubscriptionFeatureLimitType.MAX].includes(existing?.type ?? 0)}
                        />
                      </div>
                    </Fragment>
                  )}
                </div>
              }
            />
          );
        },
      });
    });

    // headers.push({
    //   name: "url",
    //   title: "URL",
    //   className: "w-32",
    //   value: (item) => (
    //     <div>
    //       <InputText
    //         // title="URL"
    //         value={item.href ?? undefined}
    //         setValue={(e) => {
    //           item.href = e?.toString() ?? "";
    //           setItems([...items]);
    //         }}
    //       />
    //     </div>
    //   ),
    // });

    setHeaders(headers);
  }, [selectedPlans, items, t]);

  function sortedItems() {
    return items.sort((a, b) => a.order - b.order);
  }

  function onAdd() {
    const lastItem = items.length > 0 ? sortedItems()[items.length - 1] : undefined;
    const item: SubscriptionFeatureInPlansDto = {
      id: uuidv4(),
      name: "untitled-feature",
      order: items.length + 1,
      accumulate: false,
      plans: selectedPlans.map((p) => {
        const lastPlanFeature = lastItem?.plans.find((f) => f.id === p.id);
        return {
          id: p.id!,
          title: lastPlanFeature?.title ?? "",
          type: lastPlanFeature?.type ?? SubscriptionFeatureLimitType.NOT_INCLUDED,
          value: lastPlanFeature?.value ?? 0,
        };
      }),
    };
    setItems([...items, item]);
  }

  function getErrors() {
    let errors: string[] = [];
    const duplicatedNames = items.filter((item, index) => items.findIndex((i) => i.name === item.name) !== index);
    if (duplicatedNames.length > 0) {
      errors = [...errors, ...duplicatedNames.map((item) => `Duplicated name "${item.name}"`)];
    }
    items.forEach((item) => {
      item.plans.forEach(({ id, title }) => {
        const plan = selectedPlans.find((p) => p.id === id);
        if (!plan) {
          return;
        }
        if (!title.trim() || title === "?") {
          errors.push(`Invalid feature title "${title}" in plan "${t(plan.title)}"`);
        }
      });
    });
    return errors;
  }

  function onSave() {
    const form = new FormData();
    form.set("action", "update-features");
    form.set("planIds", JSON.stringify(selectedPlans.map((p) => p.id)));
    form.set("features", JSON.stringify(items));
    submit(form, {
      method: "post",
    });
  }

  return (
    <Fragment>
      <EditPageLayout
        title={"Features"}
        menu={[
          { title: t("admin.pricing.title"), routePath: "/admin/settings/pricing" },
          { title: t("models.subscriptionFeature.plural"), routePath: "/admin/settings/pricing/features" },
        ]}
        buttons={
          <>
            <ButtonSecondary onClick={() => setShowPreview(true)}>
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
            <ButtonSecondary onClick={() => setItems(getInitialItems(selectedPlans))}>{t("shared.reset")}</ButtonSecondary>
            <LoadingButton disabled={getErrors().length > 0 || !getUserHasPermission(adminData, "admin.pricing.update")} onClick={onSave}>
              {t("shared.save")}
            </LoadingButton>
          </>
        }
      >
        <div className="flex space-x-1">
          <InputCombobox
            className="w-72"
            withSearch={false}
            title="Plans"
            value={selectedPlans.map((p) => p.id) as string[]}
            onChange={(e) => {
              const ids = e as string[];
              setSelectedPlans(data.items.filter((p) => ids.includes(p.id ?? "")));
            }}
            options={data.items.map((p) => ({ name: t(p.title), value: p.id }))}
            minDisplayCount={4}
          />
          {/* <div className="font-medium">Plans:</div>
            <div>{data.items.map((p) => t(p.title)).join(", ")}</div> */}
        </div>

        {getErrors().length > 0 && (
          <div>
            <ErrorBanner title="Errors">
              <div>
                {getErrors().map((error) => {
                  return <div key={error}>{error}</div>;
                })}
              </div>
            </ErrorBanner>
          </div>
        )}

        <TableSimple
          headers={headers}
          items={sortedItems()}
          actions={[
            {
              title: "Remove",
              destructive: true,
              onClick: (idx) => {
                const item = items[idx];
                if (item) {
                  setItems(items.filter((i) => i.id !== item.id));
                }
              },
            },
          ]}
        />

        <button
          type="button"
          onClick={onAdd}
          className="mt-2 flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium uppercase">{t("shared.add")}</span>
        </button>

        <Modal open={showPreview} setOpen={() => setShowPreview(false)} size="7xl">
          <PlansGrouped
            items={selectedPlans.map((f) => {
              return {
                ...f,
                features: items.map((item) => {
                  const feature = item.plans.find((p) => p.id === f.id);
                  return {
                    ...item,
                    title: feature?.title ?? "",
                    type: feature?.type ?? SubscriptionFeatureLimitType.NOT_INCLUDED,
                    value: feature?.value ?? 0,
                  };
                }),
              };
            })}
            stripeCoupon={null}
            canSubmit={false}
            currenciesAndPeriod={getCurrenciesAndPeriods(selectedPlans.flatMap((f) => f.prices))}
          />
        </Modal>
      </EditPageLayout>
    </Fragment>
  );
}

function ClosedOpenedValue({ closed, opened }: { closed: React.ReactNode; opened: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button type="button" className="hover:underline" onClick={() => setOpen(true)}>
        {closed}
      </button>
      <SlideOverWideEmpty
        withTitle={false}
        withClose={false}
        title={""}
        open={open}
        onClose={() => setOpen(false)}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            className="space-y-4"
          >
            {opened}
          </Form>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}
