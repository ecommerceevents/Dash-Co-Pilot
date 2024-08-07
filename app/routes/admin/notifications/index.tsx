import { ActionFunction, json } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import ServerError from "~/components/ui/errors/ServerError";
import NotificationMessagesTable from "~/modules/notifications/components/NotificationMessagesTable";
import NotificationService, { IGetIntegrationsData, IGetMessagesData, IGetSubscribersData } from "~/modules/notifications/services/.server/NotificationService";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  subscribers: IGetSubscribersData | null;
  messages: IGetMessagesData | null;
  integrations: IGetIntegrationsData | null;
};
export const loader = async () => {
  const subscribers = await NotificationService.getSubscribers({});
  const messages = await NotificationService.getMessages({});
  const integrations = await NotificationService.getIntegrations();
  const data: LoaderData = {
    subscribers,
    messages,
    integrations,
  };
  return json(data);
};
export const action: ActionFunction = async () => {};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-foreground text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Subscribers</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.subscribers?.totalCount ?? 0)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Messages</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.messages?.totalCount ?? 0)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="flex items-center space-x-2 truncate text-xs font-medium uppercase text-gray-500">
            <div>Integrations</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-gray-900">
            <div>{NumberUtils.numberFormat(data.integrations?.data.length ?? 0)}</div>
          </dd>
        </div>
      </dl>

      <NotificationMessagesTable items={data.messages} withPagination={false} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
