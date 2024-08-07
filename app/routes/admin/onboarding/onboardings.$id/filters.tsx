import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { Colors } from "~/application/enums/shared/Colors";
import TenantCell from "~/components/core/tenants/TenantCell";
import UserBadge from "~/components/core/users/UserBadge";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ServerError from "~/components/ui/errors/ServerError";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputSelector from "~/components/ui/input/InputSelector";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import Modal from "~/components/ui/modals/Modal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { i18nConfig } from "~/locale/i18n";
import { OnboardingWithDetails, getOnboarding, updateOnboarding, createOnboardingSession } from "~/modules/onboarding/db/onboarding.db.server";
import { getOnboardingSessions } from "~/modules/onboarding/db/onboardingSessions.db.server";
import { OnboardingCandidateDto } from "~/modules/onboarding/dtos/OnboardingCandidateDto";
import { OnboardingFilterDto } from "~/modules/onboarding/dtos/OnboardingFilterDto";
import { OnboardingFilterMetadataDto } from "~/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import { OnboardingFilterType, OnboardingFilterTypes } from "~/modules/onboarding/dtos/OnboardingFilterTypes";
import OnboardingService from "~/modules/onboarding/services/OnboardingService";
import OnboardingFilterUtils from "~/modules/onboarding/utils/OnboardingFilterUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
type LoaderData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetails;
  candidates: OnboardingCandidateDto[];
  metadata: OnboardingFilterMetadataDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const item = await getOnboarding(params.id!);
  if (!item) {
    return redirect("/admin/onboarding/onboardings");
  }
  const data: LoaderData = {
    meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
    item,
    candidates: await OnboardingService.getCandidates(item),
    metadata: await OnboardingService.getMetadata(),
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
  if (action === "set-filters") {
    const filters: { type: OnboardingFilterType; value: string | null }[] = form.getAll("filters[]").map((f) => {
      return JSON.parse(f.toString());
    });
    await updateOnboarding(item.id, {
      filters,
    });
    return json({ success: "Onboarding filters updated" });
  } else if (action === "set-realtime") {
    const realtime = form.get("realtime") === "true";
    await updateOnboarding(item.id, {
      realtime,
    });
    return json({ success: "Onboarding filters updated" });
  } else if (action === "save-sessions") {
    const candidates: OnboardingCandidateDto[] = form.getAll("candidates[]").map((f) => {
      return JSON.parse(f.toString());
    });
    const existingSessions = await getOnboardingSessions({
      onboardingId: item.id,
    });
    await Promise.all(
      candidates.map(async (candidate) => {
        const existing = existingSessions.find((f) => f.tenantId === (candidate.tenant?.id ?? null) && f.userId === candidate.user.id);
        if (existing) {
          return;
        }
        await createOnboardingSession(item, {
          userId: candidate.user.id,
          tenantId: candidate.tenant?.id ?? null,
          status: "active",
          matchingFilters: item.filters,
          createdRealtime: false,
        });
      })
    );
    return json({ success: "Onboarding sessions manually set" });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();

  const [showModal, setShowModal] = useState<{ item?: OnboardingFilterDto; idx?: number }>();

  const [filters, setFilters] = useState<OnboardingFilterDto[]>(
    data.item.filters.map((f) => {
      return {
        type: f.type as OnboardingFilterDto["type"],
        value: f.value,
      };
    })
  );

  useEffect(() => {
    const form = new FormData();
    form.append("action", "set-filters");
    filters.forEach((filter) => {
      form.append("filters[]", JSON.stringify(filter));
    });
    submit(form, {
      method: "post",
    });
  }, [filters, submit]);

  function onSetRealtime(realtime: boolean) {
    const form = new FormData();
    form.append("action", "set-realtime");
    form.append("realtime", realtime ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }
  function onSaveFilter(item: OnboardingFilterDto) {
    const idx = showModal?.idx;
    if (idx !== undefined) {
      filters[idx] = item;
    } else {
      filters.push(item);
    }
    setFilters([...filters]);
    setShowModal(undefined);
  }

  function onDeleteFilter() {
    const idx = showModal?.idx;
    if (idx !== undefined) {
      filters.splice(idx, 1);
      setFilters([...filters]);
    }
    setShowModal(undefined);
  }

  function onSaveSessions() {
    const form = new FormData();
    form.append("action", "save-sessions");
    data.candidates.forEach((c) => {
      form.append("candidates[]", JSON.stringify(c));
    });
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="mx-auto flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      {data.item.active && <ErrorBanner title={t("shared.warning")} text="You cannot edit an active onboarding." />}

      <InputGroup title={t("onboarding.object.filters")} description="Filters are used to determine if the onboarding should be shown to the user.">
        <div>
          <InputCheckboxWithDescription
            disabled={data.item.active}
            name="realtime"
            title="Realtime"
            description="Sessions will be created in realtime when the user matches the filters"
            value={data.item.realtime}
            setValue={(e) => onSetRealtime(Boolean(e))}
          />

          <div className="space-y-2">
            {filters.map((filter, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={data.item.active}
                  onClick={() => setShowModal({ item: filter, idx })}
                  className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="font-medium">{filter.type}</div>
                    {filter.value !== null && (
                      <>
                        <div>→</div>
                        <div className="italic text-gray-500">{OnboardingFilterUtils.parseValue({ t, filter, metadata: data.metadata })}</div>
                      </>
                    )}
                  </div>
                </button>
              );
            })}

            <div className="">
              <button
                type="button"
                disabled={data.item.active}
                onClick={() => setShowModal({ item: undefined, idx: undefined })}
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="block text-sm font-medium text-gray-900">Add filter</span>
              </button>
            </div>
          </div>

          {/* <div className="flex justify-end pt-4">
            <LoadingButton actionName="set-filters" type="submit">
              {t("shared.save")}
            </LoadingButton>
          </div> */}

          <OnboardingFilterModal
            open={showModal !== undefined}
            item={showModal?.item}
            idx={showModal?.idx}
            onClose={() => setShowModal(undefined)}
            onSave={onSaveFilter}
            metadata={data.metadata}
            onDelete={onDeleteFilter}
          />
        </div>
      </InputGroup>

      <div className="space-y-3">
        <div className="flex justify-between space-x-2">
          <div>
            <h3 className="text-sm font-medium leading-3 text-gray-800">Candidates</h3>
            <p className="mt-1 text-sm text-gray-500">Users that match the filters.</p>
          </div>
          <div>
            {!data.item.realtime && (
              <ButtonPrimary disabled={data.item.active} onClick={onSaveSessions}>
                Save {data.candidates.length} sessions
              </ButtonPrimary>
            )}
          </div>
        </div>
        <TableSimple
          items={data.candidates}
          headers={[
            {
              name: "tenant",
              title: t("models.tenant.object"),
              value: (item) => <TenantCell item={item.tenant} />,
            },
            {
              name: "user",
              title: t("models.user.object"),
              value: (i) => <UserBadge item={i.user} />,
            },
            {
              name: "matchingFilters",
              title: t("onboarding.filter.matching"),
              value: (i) => (
                <div className="flex flex-col">
                  {i.matchingFilters.length === 0 && <div className="italic text-gray-500">No filters - All users are candidates</div>}
                  {i.matchingFilters.map((filter, idx) => {
                    return (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{filter.type}</div>
                          {filter.value !== null && (
                            <>
                              <div>→</div>
                              <div className="italic text-gray-500">{OnboardingFilterUtils.parseValue({ t, filter, metadata: data.metadata })}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]}
        />
      </div>

      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}

function OnboardingFilterModal({
  item,
  idx,
  open,
  onClose,
  onSave,
  onDelete,
  metadata,
}: {
  item?: OnboardingFilterDto;
  idx: number | undefined;
  open: boolean;
  onClose: () => void;
  onSave: (item: OnboardingFilterDto) => void;
  onDelete: () => void;
  metadata: OnboardingFilterMetadataDto;
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [filter, setFilter] = useState<OnboardingFilterDto>();
  useEffect(() => {
    if (item) {
      setFilter(item);
    } else {
      setFilter({ type: "user.is", value: appOrAdminData.user.id });
    }
  }, [appOrAdminData.user.id, item, idx]);

  function onConfirm() {
    if (filter) {
      onSave(filter);
    }
  }

  return (
    <Modal open={open} setOpen={onClose} size="md">
      <div className="inline-block w-full p-1 text-left align-bottom sm:align-middle">
        <input name="action" type="hidden" value="create" readOnly hidden />
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-foreground text-lg font-medium leading-6">{idx === undefined ? "Add filter" : "Edit filter"}</h3>
        </div>
        <div className="mt-4 space-y-2">
          <InputSelector
            name="type"
            title={t("onboarding.object.type")}
            value={filter?.type}
            withSearch={true}
            setValue={(e) => setFilter({ ...filter, type: e as OnboardingFilterType, value: null })}
            options={OnboardingFilterTypes.map((f) => {
              return { value: f, name: f };
            })}
            required
          />
          {filter?.type === "tenant.is" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.tenants.map((t) => {
                return { value: t.id, name: t.name };
              })}
              required
            />
          ) : filter?.type === "user.is" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.users.map((t) => {
                return { value: t.id, name: t.email };
              })}
              required
            />
          ) : filter?.type === "user.roles.contains" || filter?.type === "user.roles.notContains" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              withColors={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.roles.map((t) => {
                return {
                  value: t.name,
                  name: t.type === "admin" ? `[admin] ${t.name}` : t.name,
                  color: t.type === "admin" ? Colors.RED : Colors.INDIGO,
                };
              })}
              required
            />
          ) : filter?.type === "tenant.subscription.products.has" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.subscriptionProducts.map((f) => {
                return { value: f.id, name: t(f.title) };
              })}
              required
            />
          ) : filter?.type.startsWith("tenant.user.entity") ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              withColors={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={appOrAdminData.entities.map((f) => {
                return {
                  value: f.id,
                  name: t(f.titlePlural),
                };
              })}
              required
            />
          ) : filter?.type === "user.language" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              withColors={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={i18nConfig.supportedLngs.map((f) => {
                return {
                  value: f,
                  name: t("shared.locales." + f),
                };
              })}
              required
            />
          ) : (
            <></>
            // <InputText
            //   name="value"
            //   title={t("onboarding.filter.value")}
            //   value={filter.value ?? undefined}
            //   setValue={(e) => setFilter({ ...filter, value: e.toString() ?? null })}
            //   required
            // />
          )}
        </div>
        <div className="border-border mt-3 flex justify-between border-t pt-3">
          <div>
            <ButtonSecondary destructive type="button" onClick={onDelete} className="flex justify-center" disabled={idx === undefined}>
              {t("shared.delete")}
            </ButtonSecondary>
          </div>
          <div className="flex space-x-2">
            <ButtonSecondary type="button" onClick={onClose} className="flex justify-center">
              {t("shared.cancel")}
            </ButtonSecondary>
            <ButtonPrimary disabled={!getUserHasPermission(appOrAdminData, "admin.onboarding.update")} onClick={onConfirm} className="flex justify-center">
              {t("shared.save")}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
