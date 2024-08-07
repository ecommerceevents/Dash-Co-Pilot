import { Link, useParams } from "@remix-run/react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import OpenModal from "~/components/ui/modals/OpenModal";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateUtils from "~/utils/shared/DateUtils";
import { EventWithAttempts } from "../db/events.db.server";
import MonacoEditor from "~/components/editors/MonacoEditor";

interface Props {
  items: EventWithAttempts[];
  pagination: PaginationDto;
}
export default function EventsTable({ items, pagination }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const [selectedData, setSelectedData] = useState<EventWithAttempts | undefined>(undefined);
  const formattedData = (item: EventWithAttempts) => {
    try {
      return JSON.stringify(JSON.parse(item.data), null, 2);
    } catch (e) {
      return item.data;
    }
  };
  return (
    <>
      <TableSimple
        items={items}
        actions={[
          {
            title: t("shared.details"),
            onClickRoute: (_, i) => i.id,
          },
        ]}
        pagination={pagination}
        headers={[
          {
            name: "event",
            title: t("models.event.object"),
            value: (i) => i.name,
            formattedValue: (i) => <SimpleBadge title={i.name} color={Colors.VIOLET} />,
          },
          {
            name: "data",
            title: t("models.event.data"),
            value: (i) => (
              <button type="button" onClick={() => setSelectedData(i)} className="hover:text-theme-500 truncate underline">
                {i.description}
              </button>
            ),
            className: "w-full",
          },
          // {
          //   name: "attempts",
          //   title: t("models.event.attempts"),
          //   value: (i) => i.attempts.length,
          //   formattedValue: (i) => (
          //     <div className="flex space-x-1">
          //       {i.attempts.map((f, idx) => (
          //         <Link to={i.id + "?attempt=" + f.id} key={idx}>
          //           <StatusBadge startedAt={f.startedAt} finishedAt={f.finishedAt} endpoint={f.endpoint} status={f.status} />
          //         </Link>
          //       ))}
          //     </div>
          //   ),
          // },
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (i) => (
              <div className="text-xs">
                {!i.tenant ? (
                  <span className="italic text-gray-500">?</span>
                ) : (
                  <Fragment>
                    <div className="font-medium">{i.tenant?.name}</div>
                    <Link
                      to={"/app/" + i.tenant?.slug}
                      target="_blank"
                      className="rounded-md border-b border-dashed text-xs text-gray-500 hover:border-dashed hover:border-gray-400 focus:bg-gray-100"
                    >
                      <span>/{i.tenant.slug}</span>
                    </Link>
                  </Fragment>
                )}
              </div>
            ),
            hidden: !!params.tenant,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => (
              <div className="text-xs">
                <div>{i.user?.email ?? <span className="italic text-gray-500">?</span>}</div>
                <div className="text-xs text-gray-400">{DateUtils.dateAgo(i.createdAt)}</div>
              </div>
            ),
          },
        ]}
      />

      {selectedData && (
        <OpenModal className="max-w-md" onClose={() => setSelectedData(undefined)}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <h3>
                <SimpleBadge className="text-lg" title={selectedData.name} color={Colors.VIOLET} />
              </h3>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500">{DateUtils.dateYMDHMS(selectedData.createdAt)}</div>
                <Link to={selectedData.id} className="text-gray-500 hover:text-gray-700">
                  <ExternalLinkEmptyIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold">{t("models.event.data")}</p>
              <div className="h-96 overflow-auto p-2">
                <MonacoEditor value={formattedData(selectedData)} onChange={() => {}} theme="vs-dark" language="json" />
              </div>
            </div>

            {/* {selectedData.attempts.map((attempt, idx) => {
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <h3 className="text-xs font-bold">
                      {t("models.webhookAttempt.object")} #{idx + 1}
                    </h3>
                    <StatusBadge endpoint={attempt.endpoint} status={attempt.status} startedAt={attempt.startedAt} finishedAt={attempt.finishedAt} />
                  </div>
                  <div className="grid grid-cols-12 gap-2 rounded-md border border-dashed border-gray-300 p-2">
                    <InputText className="col-span-12" name="endpoint" title={t("models.webhookAttempt.endpoint")} readOnly={true} value={attempt.endpoint} />
                    <InputText
                      className="col-span-12"
                      name="startedAt"
                      title={t("models.webhookAttempt.startedAt")}
                      readOnly={true}
                      value={DateUtils.dateYMDHMS(attempt.startedAt)}
                    />
                    <InputText
                      className="col-span-12"
                      name="finishedAt"
                      title={t("models.webhookAttempt.finishedAt")}
                      readOnly={true}
                      value={DateUtils.dateYMDHMS(attempt.finishedAt)}
                    />
                    <InputText
                      className="col-span-12"
                      name="status"
                      title={t("models.webhookAttempt.status")}
                      readOnly={true}
                      value={attempt.status?.toString() ?? "?"}
                    />
                    <InputText
                      className="col-span-12"
                      name="message"
                      title={t("models.webhookAttempt.message")}
                      readOnly={true}
                      value={attempt.message?.toString() ?? "?"}
                    />
                  </div>
                </div>
              );
            })} */}
          </div>
        </OpenModal>
      )}
    </>
  );
}
