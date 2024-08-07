import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import PaperClipIcon from "~/components/ui/icons/PaperClipIcon";
import RightIcon from "~/components/ui/icons/RightIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EmailWithSimpleDetails } from "~/utils/db/email/emails.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: EmailWithSimpleDetails[];
  withTenant: boolean;
  pagination: PaginationDto;
}
export default function EmailsTable({ items, withTenant, pagination }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<EmailWithSimpleDetails>[]>([]);

  useEffect(() => {
    const headers: RowHeaderDisplayDto<EmailWithSimpleDetails>[] = [];
    if (withTenant) {
      headers.push({
        name: "tenant",
        title: t("models.tenant.object"),
        value: (i) => i.tenantInboundAddress?.tenant.name ?? "-",
      });
    }
    headers.push({
      name: "from",
      title: t("models.email.from"),
      value: (i) => i.fromEmail,
      formattedValue: (i) => (
        <div className="flex w-40 flex-col truncate">
          <div className={clsx("truncate", i._count.reads === 0 && "font-medium text-gray-900")}>{i.fromName}</div>
          <div className="truncate">{i.fromEmail}</div>
        </div>
      ),
    });
    headers.push({
      name: "to",
      title: t("models.email.to"),
      value: (i) => i.toEmail,
      formattedValue: (i) => (
        <div className="flex w-40 flex-col truncate">
          <div className={clsx("truncate", i._count.reads === 0 && "font-medium text-gray-900")}>{i.toName}</div>
          <div className="truncate">{i.toEmail}</div>
        </div>
      ),
    });
    headers.push({
      name: "subject",
      title: t("models.email.subject"),
      value: (i) => i.subject,
      formattedValue: (i) => (
        <div className="flex max-w-sm items-center space-x-1 truncate">
          <div className={clsx(i._count.reads === 0 && "font-medium text-gray-900")}>{i.subject}</div>
          <div className="text-gray-400">-</div>
          <div className="truncate font-light text-gray-400">{i.textBody}</div>
        </div>
      ),
      href: (i) => i.id,
    });
    headers.push({
      name: "attachments",
      title: "",
      value: (i) => i._count.attachments,
      formattedValue: (i) => <div>{i._count.attachments > 0 && <PaperClipIcon className="h-4 w-4 text-gray-400" />}</div>,
    });
    headers.push({
      name: "date",
      title: t("models.email.date"),
      value: (i) => DateUtils.dateAgo(i.date),
    });
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant]);

  return (
    <div>
      <TableSimple
        onClickRoute={(_, i) => i.id}
        className={(_, i) =>
          i._count.reads === 0 ? "cursor-pointer bg-white group-hover:border-theme-500" : "cursor-pointer bg-gray-100 group-hover:border-theme-500"
        }
        items={items}
        actions={[
          {
            title: <RightIcon className="h-4 w-4" />,
            onClickRoute: (_, i) => i.id,
          },
        ]}
        headers={headers}
        pagination={pagination}
      />
    </div>
  );
}
