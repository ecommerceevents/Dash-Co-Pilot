import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import NumberUtils from "~/utils/shared/NumberUtils";
import OnboardingSessionsTable from "../../components/OnboardingSessionsTable";
import { OnboardingSummaryApi } from "../api/OnboardingSummaryApi.server";

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<OnboardingSummaryApi.LoaderData>();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-foreground text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Onboarding sessions</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-gray-900">
            <div>
              {NumberUtils.intFormat(data.summary.sessions.active)}/{NumberUtils.intFormat(data.summary.sessions.all)}
            </div>
            <div className="text-sm font-normal lowercase text-gray-500">{t("shared.active")}</div>
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Dismissed</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.sessions.dismissed)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Completed</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.sessions.completed)}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-4">
        <h3 className=" font-medium leading-4 text-gray-900">Latest sessions</h3>
        <OnboardingSessionsTable items={data.sessions.items} metadata={data.sessions.metadata} />
      </div>
    </div>
  );
}
