import { FeatureFlag, FeatureFlagFilter, Role, Tenant } from "@prisma/client";
import { useNavigation, useNavigate, Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputText from "~/components/ui/input/InputText";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import SessionFilterModal from "~/modules/shared/components/SessionFilterModal";
import { FeatureFlagsFilterType, FeatureFlagsFilterTypes } from "../dtos/FeatureFlagsFilterTypes";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { UserSimple } from "~/utils/db/users.db.server";

export default function FeatureFlagForm({
  item,
  metadata,
  onDelete,
}: {
  item?: FeatureFlag & { filters: FeatureFlagFilter[] };
  metadata: {
    users: UserSimple[];
    tenants: Tenant[];
    subscriptionProducts: SubscriptionProductDto[];
    roles: Role[];
    analytics: {
      via: { name: string; count: number }[];
      httpReferrer: { name: string; count: number }[];
      browser: { name: string; count: number }[];
      os: { name: string; count: number }[];
      source: { name: string; count: number }[];
      medium: { name: string; count: number }[];
      campaign: { name: string; count: number }[];
    };
  };
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [showFilterModal, setShowFilterModal] = useState<{
    item?: { type: FeatureFlagsFilterType; value: string | null; action: string | null };
    idx?: number;
  }>();

  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [filters, setFilters] = useState<{ type: FeatureFlagsFilterType; value: string | null; action: string | null }[]>(
    item?.filters.map((f) => {
      return {
        type: f.type as FeatureFlagsFilterType,
        value: f.value,
        action: f.action,
      };
    }) || []
  );

  useEffect(() => {
    if (!item) {
      // setName(StringUtils.toCamelCase(description.toLowerCase()));
      if (name === "currency") {
        setDescription("Set default currency");
      }
    }
  }, [item, name]);

  function onSaveFilter(item: { type: FeatureFlagsFilterType; value: string | null; action: string | null }) {
    const idx = showFilterModal?.idx;
    if (idx !== undefined) {
      filters[idx] = item;
    } else {
      filters.push(item);
    }
    setFilters([...filters]);
    setShowFilterModal(undefined);
  }
  function getActionName() {
    return item ? "edit" : "new";
  }

  // const hasDefaultFlag = ["currency"].includes(name);

  return (
    <div>
      <SlideOverWideEmpty
        title={item ? "Edit flag" : "Create flag"}
        description={item ? "Edit the feature flag." : "Create a new feature flag."}
        open={true}
        onClose={() => {
          navigate("/admin/feature-flags/flags");
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
          <input type="hidden" name="action" value={getActionName()} />
          {filters.map((filter, index) => {
            return <input type="hidden" name="filters[]" value={JSON.stringify(filter)} key={index} />;
          })}

          <div className="space-y-2">
            <InputText name="name" title={t("shared.name")} value={name} setValue={setName} required hint={<span>Internal name</span>} />
            <InputText autoFocus name="description" title={t("shared.title")} value={description} setValue={setDescription} required />

            <div>
              <div className="mb-1 flex items-center justify-between space-x-2 text-xs">
                <label className="font-medium text-gray-600">{t("featureFlags.filters")}</label>
                <button type="button" onClick={() => setFilters([])} className="text-gray-500 hover:text-gray-700">
                  {t("shared.clear")}
                </button>
              </div>

              <div className="space-y-2 text-gray-800">
                {filters.map((filter, idx) => {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setShowFilterModal({ item: filter, idx })}
                      className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <div className="flex items-center space-x-1 truncate">
                        <div className="truncate font-medium">{filter.type}</div>
                        <div className="truncate italic">
                          {filter.value === null ? (
                            <span className="text-red-500">null</span>
                          ) : filter.type === "user.createdAfter" || filter.type === "user.createdBefore" ? (
                            new Date(filter.value).toLocaleDateString()
                          ) : (
                            filter.value
                          )}
                          {filter.action && ` → ${filter.action}`}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="">
                  <button
                    type="button"
                    onClick={() => setShowFilterModal({ item: undefined, idx: undefined })}
                    className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <span className="block text-sm font-medium text-gray-900">Add filter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
            <div>
              {onDelete && (
                <ButtonSecondary disabled={navigation.state === "submitting"} type="button" className="w-full" onClick={onDelete} destructive>
                  <div>{t("shared.delete")}</div>
                </ButtonSecondary>
              )}
            </div>
            <div className="flex space-x-2">
              <ButtonSecondary onClick={() => navigate("/admin/feature-flags/flags")}>{t("shared.cancel")}</ButtonSecondary>
              <LoadingButton actionName={getActionName()} type="submit" disabled={navigation.state === "submitting"}>
                {t("shared.save")}
              </LoadingButton>
            </div>
          </div>
        </Form>

        <SessionFilterModal
          flagName={name}
          filters={FeatureFlagsFilterTypes.map((f) => f.toString())}
          open={showFilterModal !== undefined}
          item={showFilterModal?.item}
          idx={showFilterModal?.idx}
          onClose={() => setShowFilterModal(undefined)}
          onSave={({ type, value, action }) => onSaveFilter({ type: type as FeatureFlagsFilterType, value, action: action ?? null })}
          metadata={metadata}
          onRemove={(idx) => {
            filters.splice(idx, 1);
            setFilters([...filters]);
          }}
        />
      </SlideOverWideEmpty>
    </div>
  );
}
