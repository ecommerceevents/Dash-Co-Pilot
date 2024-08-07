import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateUtils from "~/utils/shared/DateUtils";
import { IGetMessagesData } from "../services/.server/NotificationService";

export default function NotificationMessagesTable({ items, withPagination = true }: { items: IGetMessagesData | null; withPagination?: boolean }) {
  return (
    <TableSimple
      items={items?.data ?? []}
      pagination={
        !withPagination
          ? undefined
          : {
              page: (items?.page ?? 0) + 1,
              pageSize: items?.pageSize ?? 0,
              totalItems: items?.totalCount ?? 0,
              totalPages: Math.ceil((items?.totalCount ?? 0) / (items?.pageSize ?? 0)),
            }
      }
      headers={[
        {
          name: "createdAt",
          title: "Created at",
          value: (i) => (
            <div className="flex flex-col">
              <div>{DateUtils.dateYMD(i.createdAt)}</div>
              <div className="text-xs">{DateUtils.dateAgo(i.createdAt)}</div>
            </div>
          ),
        },
        { name: "templateIdentifier", title: "Template", value: (i) => i.templateIdentifier },
        { name: "channel", title: "Channel", value: (i) => i.channel },
        {
          name: "seen",
          title: "Seen",
          value: (i) => <div>{i.seen ? <CheckIcon className="text-theme-500 h-4 w-4" /> : <XIcon className="h-4 w-4 text-gray-500" />}</div>,
        },
        {
          name: "read",
          title: "Read",
          value: (i) => <div>{i.read ? <CheckIcon className="text-theme-500 h-4 w-4" /> : <XIcon className="h-4 w-4 text-gray-500" />}</div>,
        },
        {
          name: "payload",
          title: "Payload",
          value: (i) => (
            <pre className="max-w-sm truncate">
              <ShowPayloadModalButton payload={i.payload} />
            </pre>
          ),
        },
        { name: "_id", title: "_id", value: (i) => i._id },
      ]}
    ></TableSimple>
  );
}
