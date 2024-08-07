import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ServerError from "~/components/ui/errors/ServerError";
import NotificationSubscribersTable from "~/modules/notifications/components/NotificationSubscribersTable";
import NotificationService, { IGetSubscribersData } from "~/modules/notifications/services/.server/NotificationService";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

type LoaderData = {
  items: IGetSubscribersData | null;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const items = await NotificationService.getSubscribers(currentPagination);
  const data: LoaderData = {
    items,
  };
  return json(data);
};
export const action: ActionFunction = async ({ request, params }) => {};

export default function () {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="md:border-b md:border-gray-200 md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium leading-6">Subscribers</h3>
            <div className="flex items-center space-x-2">{/* <InputFilters filters={[]} /> */}</div>
          </div>
        </div>

        <NotificationSubscribersTable items={data.items} />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
