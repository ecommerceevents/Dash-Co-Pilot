import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, useActionData, useLocation, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { NewMemberActionData } from "~/routes/app.$tenant/settings/members/new";
import UrlUtils from "~/utils/app/UrlUtils";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import CheckPlanFeatureLimit from "../subscription/CheckPlanFeatureLimit";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import toast from "react-hot-toast";

interface Props {
  featurePlanUsage: PlanFeatureUsageDto | undefined;
}

export default function NewMember({ featurePlanUsage }: Props) {
  const params = useParams();
  const location = useLocation();
  const actionData = useActionData<NewMemberActionData>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const loading = navigation.state === "submitting";

  const inputEmail = useRef<HTMLInputElement>(null);

  const [sendEmail, setSendEmail] = useState<boolean>(false);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  useEffect(() => {
    // nextTick(() => {
    if (inputEmail.current) {
      inputEmail.current?.focus();
      inputEmail.current?.select();
    }
    // });
  }, []);

  function close() {
    if (location.pathname.startsWith("/app")) {
      navigate(UrlUtils.currentTenantUrl(params, "settings/members"), { replace: true });
    } else {
      navigate("/admin/members", { replace: true });
    }
  }

  useEscapeKeypress(close);
  return (
    <CheckPlanFeatureLimit item={featurePlanUsage}>
      <Form method="post" className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {/*Email */}
          <div className="col-span-2">
            <label htmlFor="email" className="block truncate text-xs font-medium text-gray-700">
              <div className="flex space-x-1 truncate">
                <div>{t("models.user.email")}</div>
                <div className="ml-1 text-red-500">*</div>
              </div>
            </label>
            <div className="mt-1 flex w-full rounded-md shadow-sm">
              <input
                type="email"
                ref={inputEmail}
                name="email"
                id="email"
                autoComplete="off"
                required
                defaultValue={actionData?.fields?.email}
                disabled={loading}
                className={clsx(
                  "focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 lowercase sm:text-sm",
                  loading && "cursor-not-allowed bg-gray-100"
                )}
              />
            </div>
          </div>
          {/*Email: End */}

          {/*User First Name */}
          <div>
            <label htmlFor="first-name" className="block truncate text-xs font-medium text-gray-700">
              <div className="flex space-x-1 truncate">
                <div>{t("models.user.firstName")}</div>
                <div className="ml-1 text-red-500">*</div>
              </div>
            </label>
            <div className="mt-1 flex w-full rounded-md shadow-sm">
              <input
                type="text"
                id="first-name"
                name="first-name"
                autoComplete="off"
                required
                defaultValue={actionData?.fields?.firstName}
                className={clsx(
                  "focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
                  loading && "cursor-not-allowed bg-gray-100"
                )}
              />
            </div>
          </div>
          {/*User First Name: End */}

          {/*User Last Name */}
          <div>
            <label htmlFor="last-name" className="block truncate text-xs font-medium text-gray-700">
              {t("models.user.lastName")}
            </label>
            <div className="mt-1 flex w-full rounded-md shadow-sm">
              <input
                type="text"
                id="last-name"
                name="last-name"
                autoComplete="off"
                defaultValue={actionData?.fields?.lastName}
                className={clsx(
                  "focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
                  loading && "cursor-not-allowed bg-gray-100"
                )}
              />
            </div>
          </div>
          {/*User Last Name: End */}

          <div className="col-span-2">
            <InputCheckboxWithDescription
              name="send-invitation-email"
              title="Send email"
              description="Send an invitation email to the user"
              value={sendEmail}
              setValue={setSendEmail}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-theme-700 text-sm">{loading && <div>{t("shared.loading")}...</div>}</div>

          <div className="flex items-center space-x-2">
            <button
              disabled={loading}
              className={clsx(
                "focus:ring-theme-500 inline-flex items-center space-x-2 border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:rounded-md sm:text-sm",
                loading && "cursor-not-allowed bg-gray-100"
              )}
              type="button"
              onClick={close}
            >
              <div>{t("shared.cancel")}</div>
            </button>
            <button
              disabled={loading}
              className={clsx(
                "bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center space-x-2 border border-transparent px-3 py-2 font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:rounded-md sm:text-sm",
                loading && "cursor-not-allowed opacity-50"
              )}
              type="submit"
            >
              <div>{t("shared.invite")}</div>
            </button>
          </div>
        </div>
      </Form>
    </CheckPlanFeatureLimit>
  );
}
