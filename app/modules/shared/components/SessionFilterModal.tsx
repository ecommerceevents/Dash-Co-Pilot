import { Tenant } from "@prisma/client";
import { Form } from "@remix-run/react";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import currencies from "~/application/pricing/currencies";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputDate from "~/components/ui/input/InputDate";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import Modal from "~/components/ui/modals/Modal";
import { i18nConfig } from "~/locale/i18n";
import { UserWithNames } from "~/utils/db/users.db.server";

export default function SessionFilterModal({
  flagName,
  filters,
  item,
  idx,
  open,
  onClose,
  onSave,
  metadata,
  onRemove,
}: {
  flagName?: string;
  filters: string[];
  item?: {
    type: string;
    value: string | null;
    action?: string | null;
  };
  idx: number | undefined;
  open: boolean;
  onClose: () => void;
  onSave: (item: { type: string; value: string | null; action?: string | null }) => void;
  onRemove?: (idx: number) => void;
  metadata: {
    users: UserWithNames[];
    tenants: Tenant[];
    subscriptionProducts: SubscriptionProductDto[];
    roles: { id: string; name: string }[];
    analytics?: {
      via: { name: string; count: number }[];
      httpReferrer: { name: string; count: number }[];
      browser: { name: string; count: number }[];
      os: { name: string; count: number }[];
      source: { name: string; count: number }[];
      medium: { name: string; count: number }[];
      campaign: { name: string; count: number }[];
    };
  };
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<{ type: string; value: string | null; action?: string | null }>();
  const [actions, setActions] = useState<{
    title: string;
    options: { name: string; value: string }[];
  }>();

  useEffect(() => {
    if (flagName === "currency") {
      setActions({ title: "Currency", options: currencies.filter((f) => !f.disabled).map((f) => ({ name: f.name, value: f.value })) });
    }
  }, [flagName]);

  useEffect(() => {
    setFilter(item);
  }, [item]);

  function onConfirm() {
    if (!filter?.type) {
      return;
    }
    onSave(filter);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onConfirm();
  }

  return (
    <Modal open={open} setOpen={onClose} size="md">
      <Form onSubmit={onSubmit} className="inline-block w-full p-1 text-left align-bottom sm:align-middle">
        <input name="action" type="hidden" value="create" readOnly hidden />
        <div className="mt-3 text-center">
          <h3 className="text-foreground text-lg font-medium leading-6">{idx === undefined ? "Add filter" : "Edit filter"}</h3>
        </div>
        <div className="mt-4 space-y-2">
          <InputSelector
            name="type"
            title={t("shared.type")}
            value={filter?.type}
            withSearch={true}
            setValue={(e) => setFilter({ type: e?.toString() ?? "", value: filter?.value ?? null, action: filter?.action ?? null })}
            options={filters.map((f) => {
              return { value: f, name: f };
            })}
            required
          />
          {filter?.type === "tenant.is" ? (
            <InputSelector
              name="value"
              title={t("shared.value")}
              disabled={!filter?.type}
              value={filter?.value ?? undefined}
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
              title={t("shared.value")}
              disabled={!filter?.type}
              value={filter?.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.users.map((t) => {
                return { value: t.email, name: t.email };
              })}
              required
            />
          ) : ["user.roles.contains", "user.roles.notContains"].includes(filter?.type ?? "") ? (
            <InputSelector
              name="value"
              title={t("shared.value")}
              disabled={!filter?.type}
              value={filter?.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ type: filter?.type ?? "", value: e?.toString() ?? null, action: filter?.action ?? null })}
              options={metadata.roles.map((t) => {
                return { value: t.name, name: t.name };
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
          ) : filter?.type === "env" ? (
            <FilterSelector
              filter={filter}
              setFilter={setFilter}
              options={[
                { value: "production", name: "Production" },
                { value: "development", name: "Development" },
                { value: "staging", name: "Staging" },
              ]}
            />
          ) : filter?.type === "percentage" ? (
            <FilterSelector
              filter={filter}
              setFilter={setFilter}
              options={Array.from({ length: 10 }, (_, i) => i + 1).map((f) => {
                return {
                  value: `${f * 10}`,
                  name: `${f * 10}%`,
                };
              })}
            />
          ) : ["session.darkMode", "session.logged", "tenant.subscription.active", "tenant.api.used"].includes(filter?.type ?? "") ? (
            <FilterSelector
              filter={filter}
              setFilter={setFilter}
              options={[
                { value: "true", name: "True" },
                { value: "false", name: "False" },
              ]}
            />
          ) : ["user.language", "session.language"].includes(filter?.type ?? "") ? (
            <FilterSelector
              filter={filter}
              setFilter={setFilter}
              options={i18nConfig.supportedLngs.map((f) => {
                return {
                  value: f,
                  name: f,
                };
              })}
            />
          ) : metadata.analytics && filter?.type.startsWith("analytics.") ? (
            <AnalyticsSelector filter={filter} setFilter={setFilter} analytics={metadata.analytics} />
          ) : filter?.type === "page" ? (
            <FilterSelector
              filter={filter}
              setFilter={setFilter}
              options={[
                { name: "Landing", value: "/" },
                { name: "Pricing", value: "/pricing" },
                { name: "Contact", value: "/contact" },
                { name: "Blog", value: "/blog" },
                { name: "Newsletter", value: "/newsletter" },
                { name: "Login", value: "/login" },
                { name: "Register", value: "/register" },
                { name: "Forgot password", value: "/forgot-password" },
                { name: "Reset password", value: "/reset" },
                { name: "Docs", value: "/docs" },
              ]}
            />
          ) : ["user.createdAfter", "user.createdBefore"].includes(filter?.type ?? "") ? (
            <InputDate
              name="value"
              title={t("shared.value")}
              disabled={!filter?.type}
              value={filter?.value ? new Date(filter?.value) : undefined}
              onChange={(e) => setFilter({ type: filter?.type ?? "", value: e?.toISOString() ?? null, action: filter?.action ?? null })}
              required
            />
          ) : (
            <InputText
              name="value"
              title={t("shared.value")}
              disabled={!filter?.type}
              value={filter?.value ?? undefined}
              setValue={(e) => setFilter({ type: filter?.type ?? "", value: e.toString() ?? null, action: filter?.action ?? null })}
              required
            />
          )}

          {actions && actions.options.length > 0 && (
            <InputSelector
              value={filter?.action ?? undefined}
              setValue={(e) => setFilter({ type: filter?.type ?? "", value: filter?.value ?? null, action: e?.toString() ?? null })}
              name="flagAction"
              title={actions.title}
              options={actions.options}
              required
            />
          )}
        </div>
        <div className="mt-3 flex justify-between space-x-2">
          <div>
            {onRemove && idx !== undefined && (
              <ButtonSecondary
                type="button"
                destructive
                onClick={() => {
                  onRemove(idx);
                  onClose();
                }}
              >
                {t("shared.remove")}
              </ButtonSecondary>
            )}
          </div>
          <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
        </div>
      </Form>
    </Modal>
  );
}

function FilterSelector({
  filter,
  setFilter,
  options,
}: {
  filter: { type: string; value: string | null; action?: string | null } | undefined;
  setFilter: Dispatch<
    SetStateAction<
      | {
          type: string;
          value: string | null;
          action?: string | null;
        }
      | undefined
    >
  >;
  options: { name: string; value: string }[];
}) {
  const { t } = useTranslation();
  return (
    <Fragment>
      {["analytics.countryCode", "analytics.regionCode", "analytics.city", "analytics.zipCode"].includes(filter?.type ?? "") ? (
        <InputText
          name="value"
          title={t("shared.value")}
          disabled={!filter?.type}
          value={filter?.value ?? undefined}
          setValue={(e) => setFilter({ type: filter?.type ?? "", value: e.toString() ?? null, action: filter?.action ?? null })}
          required
        />
      ) : (
        <InputSelector
          name="value"
          title={t("shared.value")}
          disabled={!filter?.type}
          value={filter?.value ?? undefined}
          withSearch={true}
          setValue={(e) => setFilter({ type: filter?.type ?? "", value: e?.toString() ?? null, action: filter?.action ?? null })}
          options={options}
          required
        />
      )}
    </Fragment>
  );
}

function AnalyticsSelector({
  filter,
  setFilter,
  analytics,
}: {
  filter: { type: string; value: string | null; action?: string | null } | undefined;
  setFilter: Dispatch<SetStateAction<{ type: string; value: string | null; action?: string | null } | undefined>>;
  analytics: {
    via: { name: string; count: number }[];
    httpReferrer: { name: string; count: number }[];
    browser: { name: string; count: number }[];
    os: { name: string; count: number }[];
    source: { name: string; count: number }[];
    medium: { name: string; count: number }[];
    campaign: { name: string; count: number }[];
  };
}) {
  const [options, setOptions] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    let options: { name: string; count: number }[] = [];
    if (filter?.type === "analytics.via") {
      options = analytics.via;
    } else if (filter?.type === "analytics.httpReferrer") {
      options = analytics.httpReferrer;
    } else if (filter?.type === "analytics.browser") {
      options = analytics.browser;
    } else if (filter?.type === "analytics.os") {
      options = analytics.os;
    } else if (filter?.type === "analytics.source") {
      options = analytics.source;
    } else if (filter?.type === "analytics.medium") {
      options = analytics.medium;
    } else if (filter?.type === "analytics.campaign") {
      options = analytics.campaign;
    }
    setOptions(options);
  }, [filter, analytics]);

  return (
    <FilterSelector
      filter={filter}
      setFilter={setFilter}
      options={options.map((f) => {
        return {
          value: f.name || "null",
          name: `${f.name || "null"} (${f.count})`,
        };
      })}
    />
  );
}
