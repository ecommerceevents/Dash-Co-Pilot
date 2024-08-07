import { Link } from "@remix-run/react";
import UserBadge from "~/components/core/users/UserBadge";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateUtils from "~/utils/shared/DateUtils";
import { IGetSubscribersData } from "../services/.server/NotificationService";

export default function NotificationSubscribersTable({ items }: { items: IGetSubscribersData | null }) {
  return (
    <TableSimple
      items={items?.data ?? []}
      pagination={{
        page: (items?.page ?? 0) + 1,
        pageSize: items?.pageSize ?? 0,
        totalItems: items?.totalCount ?? 0,
        totalPages: Math.ceil((items?.totalCount ?? 0) / (items?.pageSize ?? 0)),
      }}
      headers={[
        {
          name: "subscriber",
          title: "Subscriber",
          value: (i) => (
            <div>
              {!i.email ? (
                <div>-</div>
              ) : (
                <Link to={"/admin/notifications/messages?subscriberId=" + i.subscriberId}>
                  <UserBadge
                    item={{
                      id: i.subscriberId,
                      email: i.email,
                      firstName: i.firstName,
                      lastName: i.lastName,
                    }}
                  />
                </Link>
              )}
            </div>
          ),
        },
        { name: "createdAt", title: "createdAt", value: (i) => DateUtils.dateAgo(new Date(i.createdAt)) },
        { name: "updatedAt", title: "updatedAt", value: (i) => DateUtils.dateAgo(new Date(i.updatedAt)) },
        {
          name: "deleted",
          title: "deleted",
          value: (i) => <div>{i.deleted ? <CheckIcon className="text-theme-500 h-4 w-4" /> : <XIcon className="h-4 w-4 text-gray-500" />}</div>,
        },
      ]}
    ></TableSimple>
  );
}
