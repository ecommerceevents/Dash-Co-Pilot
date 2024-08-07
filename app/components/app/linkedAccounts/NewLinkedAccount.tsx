import { useTranslation } from "react-i18next";
import { FormEvent, useEffect, useRef, useState } from "react";
import { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { Form, useNavigate, useParams, useSubmit } from "@remix-run/react";
import UrlUtils from "~/utils/app/UrlUtils";
import { NewLinkedAccountActionData } from "~/routes/app.$tenant/settings/linked-accounts/new";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputText from "~/components/ui/input/InputText";
import InputSelector from "~/components/ui/input/InputSelector";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import { UserSimple } from "~/utils/db/users.db.server";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { useTypedActionData } from "remix-typedjson";

interface Props {
  linksCount: number;
  featurePlanUsage: PlanFeatureUsageDto | undefined;
}

export default function NewLinkedAccount({ linksCount, featurePlanUsage }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const submit = useSubmit();
  const actionData = useTypedActionData<NewLinkedAccountActionData>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>();

  const [foundUser, setFoundUser] = useState<{
    user: UserSimple;
    tenants: TenantSimple[];
  }>();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmCreateLinkModal = useRef<RefConfirmModal>(null);

  const [imProvider, setAsProvider] = useState(false);

  const [selectedTenantId, setSelectedTenantId] = useState<string>();

  useEffect(() => {
    if (actionData?.findUserAccounts) {
      setFoundUser(actionData.findUserAccounts);
      if (!selectedTenantId && actionData?.findUserAccounts.tenants.length > 0) {
        setSelectedTenantId(actionData.findUserAccounts.tenants[0].id);
      }
    }
  }, [actionData, selectedTenantId]);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFormData(formData);
    if (formData.get("action") === "invite") {
      const selectedTenant = foundUser?.tenants.find((t) => t.id === selectedTenantId);
      if (!selectedTenant) {
        return;
      }
      const confirmText = t("shared.invite");
      const inviteText = t("app.linkedAccounts.invitation.invite", { 0: foundUser?.user.email, 1: selectedTenant.name });
      if (imProvider) {
        confirmCreateLinkModal.current?.show(t("app.clients.new.add"), confirmText, t("shared.cancel"), inviteText);
      } else {
        confirmCreateLinkModal.current?.show(t("app.providers.new.add"), confirmText, t("shared.cancel"), inviteText);
      }
    } else if (formData.get("action") === "get-accounts") {
      submit(formData, {
        method: "post",
      });
    }
  }

  function yesSubmit() {
    if (formData) {
      submit(formData, {
        method: "post",
      });
    }
  }

  return (
    <div>
      <CheckPlanFeatureLimit item={featurePlanUsage}>
        <Form onSubmit={handleSubmit}>
          {!foundUser ? (
            <input name="action" type="hidden" value="get-accounts" readOnly hidden />
          ) : (
            <>
              <input name="action" type="hidden" value="invite" readOnly hidden />
            </>
          )}

          <div className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between space-x-2">
                <h3 className="text-sm font-medium leading-3 text-gray-800">
                  {/* {imProvider ? t("app.linkedAccounts.newClient") : t("app.linkedAccounts.newProvider")} */}
                  {t("app.linkedAccounts.link")}
                </h3>
              </div>
              {/* <p className="mt-1 text-sm text-gray-500">{t("app.linkedAccounts.newDescription")}</p> */}
            </div>

            <div>
              <div className="grid grid-cols-12 gap-4">
                <InputText
                  autoFocus
                  className="col-span-12"
                  title={t("account.shared.email")}
                  type="email"
                  name="email"
                  autoComplete="off"
                  required
                  readOnly={!!foundUser}
                  defaultValue={undefined}
                />

                {foundUser && (
                  <>
                    <InputSelector
                      withSearch={false}
                      className="col-span-12"
                      title={t("models.tenant.plural")}
                      name="selected-tenant-id"
                      value={selectedTenantId}
                      setValue={(e) => setSelectedTenantId(e?.toString())}
                      options={foundUser.tenants.map((f) => {
                        return { value: f.id, name: f.name };
                      })}
                    />
                    <InputCheckboxInline
                      className="col-span-12"
                      name="imProvider"
                      title={t("app.linkedAccounts.imTheProvider")}
                      value={imProvider}
                      setValue={setAsProvider}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              {!foundUser ? (
                <ButtonSecondary type="submit">{t("app.linkedAccounts.invitation.findAccounts")}</ButtonSecondary>
              ) : (
                <>
                  <ButtonSecondary type="button" onClick={() => setFoundUser(undefined)}>
                    {t("shared.cancel")}
                  </ButtonSecondary>
                  <LoadingButton className="bg-theme-600" type="submit" disabled={!selectedTenantId}>
                    {t("app.linkedAccounts.invitation.send")}
                  </LoadingButton>
                </>
              )}
            </div>

            {actionData?.error && <ErrorBanner title={t("shared.error")} text={actionData?.error} />}
          </div>
        </Form>
      </CheckPlanFeatureLimit>

      <ConfirmModal ref={confirmCreateLinkModal} onYes={yesSubmit} />
      <SuccessModal ref={successModal} onClosed={() => navigate(UrlUtils.currentTenantUrl(params, `settings/linked-accounts`))} />
    </div>
  );
}
