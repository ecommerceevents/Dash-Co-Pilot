import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import ServerError from "~/components/ui/errors/ServerError";
import InputFilters from "~/components/ui/input/InputFilters";
import NotificationMessagesTable from "~/modules/notifications/components/NotificationMessagesTable";
import NotificationService, { IGetMessagesData } from "~/modules/notifications/services/.server/NotificationService";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

type LoaderData = {
  items: IGetMessagesData | null;
  filterableProperties: FilterablePropertyDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "subscriberId",
      title: "Subscriber ID",
    },
    {
      name: "channel",
      title: "Channel",
    },
  ];
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const items = await NotificationService.getMessages({
    limit: currentPagination.pageSize,
    page: currentPagination.page,
    subscriberId: urlSearchParams.get("subscriberId")?.toString(),
    channel: urlSearchParams.get("channel")?.toString(),
  });
  const data: LoaderData = {
    items,
    filterableProperties,
  };
  return json(data);
};
export const action: ActionFunction = async ({ request, params }) => {};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="md:border-b md:border-gray-200 md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium leading-6">Messages</h3>
            <div className="flex items-center space-x-2">
              <InputFilters filters={data.filterableProperties} />
            </div>
          </div>
        </div>

        <NotificationMessagesTable items={data.items} />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
