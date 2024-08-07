import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LogWithDetails } from "~/utils/db/logs.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: LogWithDetails[];
}

export default function RowLogs({ items }: Props) {
  const { t } = useTranslation();

  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return x.createdAt > y.createdAt ? -1 : 1;
      }
      return -1;
    });
  };

  function dateDM(value: Date | undefined) {
    return DateUtils.dateDM(value);
  }

  return (
    <div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-3 text-gray-800">
          <div className="flex items-center space-x-1">
            <div>
              <span className=" font-light italic"></span> {t("app.shared.activity.title")}
            </div>
          </div>
        </h3>
        <div className="rounded-md border border-gray-100 bg-white py-5 px-4 shadow">
          <div className="flow-root">
            <ul className="-mb-8">
              {sortedItems().length === 0 && <div className=" mb-6 flex justify-center text-sm italic text-gray-500">No events</div>}
              {sortedItems().map((activity, idxActivity) => {
                return (
                  <li key={idxActivity}>
                    <div className="relative pb-8">
                      {items.length > 0 && idxActivity + 1 < items.length && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      )}

                      <div className="relative flex space-x-3">
                        <div>
                          <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white")}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="flex-grow">
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            <div className="truncate">
                              <div className="text-sm text-gray-500">
                                <div className="truncate text-gray-900">
                                  <span title={activity.action}>{activity.action}</span>
                                </div>
                              </div>
                            </div>
                            <div className="truncate whitespace-nowrap text-right text-xs lowercase text-gray-500">
                              {activity.createdAt && (
                                <time dateTime={DateUtils.dateYMDHMS(activity.createdAt)}>
                                  {dateDM(activity.createdAt)}, {DateUtils.dateHMS(activity.createdAt)}
                                </time>
                              )}
                            </div>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            {activity.user && <div className="text-xs font-light">{activity.user.email}</div>}
                            {activity.apiKey && <div className="text-xs font-light">{activity.apiKey.alias}</div>}
                            {!activity.user && !activity.apiKey && <div className="text-xs font-light">{t("shared.anonymousUser")}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
