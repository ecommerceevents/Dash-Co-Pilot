import { useTranslation } from "react-i18next";
import DateUtils from "~/utils/shared/DateUtils";
import { useEffect, useState } from "react";
import { LogWithDetails } from "~/utils/db/logs.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import TableSimple from "~/components/ui/tables/TableSimple";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { Link } from "@remix-run/react";
import LogDetailsButton from "./LogDetailsButton";

interface Props {
  items: LogWithDetails[];
  withTenant: boolean;
  pagination: PaginationDto;
}

export default function LogsTable({ withTenant, items, pagination }: Props) {
  const { t } = useTranslation();

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<LogWithDetails>[]>([]);

  useEffect(() => {
    let headers: RowHeaderDisplayDto<LogWithDetails>[] = [];
    if (withTenant) {
      headers.push({
        name: "tenant",
        title: t("models.tenant.object"),
        value: (item) => (
          <div>
            {item.tenant ? (
              <Link to={`/app/${item.tenant?.slug}`} className="rounded-md border-b border-dashed border-transparent hover:border-gray-400 focus:bg-gray-100">
                {item.tenant.name}
              </Link>
            ) : (
              <div>-</div>
            )}
          </div>
        ),
        breakpoint: "sm",
      });
    }
    headers = [
      ...headers,
      {
        name: "action",
        title: t("models.log.action"),
        value: (item) => <div>{item.action}</div>,
      },
      {
        name: "url",
        title: t("models.log.url"),
        value: (item) => <div>{item.url}</div>,
      },
      {
        name: "details",
        title: t("models.log.details"),
        value: (item) => <LogDetailsButton item={item} />,
      },
      {
        name: "createdBy",
        title: t("shared.createdBy"),
        value: (item) => (
          <div>
            {item.user && (
              <span>
                {item.user.firstName} {item.user.lastName} <span className=" text-xs text-gray-500">({item.user.email})</span>
              </span>
            )}
            {item.apiKey && (
              <span>
                API Key <span className=" text-xs text-gray-500">({item.apiKey.alias})</span>
              </span>
            )}
          </div>
        ),
      },
      {
        name: "createdAt",
        title: t("shared.createdAt"),
        value: (item) => DateUtils.dateAgo(item.createdAt),
        formattedValue: (item) => (
          <div className="flex flex-col">
            <div>{DateUtils.dateYMD(item.createdAt)}</div>
            <div className="text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
          </div>
        ),
        className: "text-gray-400 text-xs",
        breakpoint: "sm",
        sortable: true,
      },
    ];
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant]);

  return <TableSimple items={items} headers={headers} pagination={pagination} className={() => "text-sm"} />;
}
