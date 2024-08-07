import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link, useNavigation } from "@remix-run/react";
import { Stat } from "~/application/dtos/stats/Stat";
import { StatChange } from "~/application/dtos/stats/StatChange";
import { Fragment } from "react";

interface Props {
  items: Stat[];
}

export function DashboardStats({ items }: Props) {
  const navigation = useNavigation();
  const loading = navigation.state === "loading" && navigation.location.pathname === "/admin/dashboard";
  return (
    <div>
      <div
        className={clsx(
          "grid grid-cols-2 gap-4 overflow-hidden rounded-lg sm:grid-cols-3",
          items.length === 1 && "md:grid-cols-1",
          items.length === 2 && "md:grid-cols-2",
          items.length === 3 && "md:grid-cols-3",
          items.length === 4 && "md:grid-cols-4",
          items.length === 5 && "md:grid-cols-4 lg:grid-cols-5",
          items.length === 6 && "md:grid-cols-4 lg:grid-cols-6"
        )}
      >
        {items.map((item, idx) => (
          <Fragment key={idx}>
            {item.path ? (
              <Link to={item.path} className="flex justify-between space-x-1 truncate rounded-lg border border-gray-200 bg-white p-5 hover:bg-gray-50">
                <DashboardStat item={item} loading={loading} />
              </Link>
            ) : (
              <DashboardStat className="flex justify-between space-x-1 truncate rounded-lg border border-gray-200 bg-white p-5" item={item} loading={loading} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function DashboardStat({ item, loading, className }: { item: Stat; loading: boolean; className?: string }) {
  const { t } = useTranslation();
  return (
    <div key={item.name} className={className}>
      <div className="truncate">
        <div className="flex items-baseline space-x-2 text-sm text-gray-500">
          <div>{t(item.name)}</div>
          {item.hint && <div className="hidden text-xs text-gray-400 xl:block">({t(item.hint)})</div>}
        </div>

        <div className="flex items-baseline space-x-2 text-2xl font-medium text-gray-900">
          <div>{loading ? "..." : item.stat}</div>
          {item.previousStat !== undefined && (
            <span className="ml-2 hidden text-sm font-medium text-gray-500 xl:block">{!loading && <span>from {item.previousStat}</span>}</span>
          )}
        </div>
      </div>
      {item.changeType === StatChange.Increase ? (
        <div className="mt-1 flex flex-shrink-0 gap-1 truncate text-green-600">
          {loading ? (
            "..."
          ) : (
            <>
              {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="flex gap-2 text-xs">
                      <span className="font-medium">
                        <div>{item.change}</div>
                      </span>
                    </div> */}
            </>
          )}
        </div>
      ) : item.changeType === StatChange.Decrease ? (
        <div className="mt-1 flex gap-1 text-red-600">
          {loading ? (
            "..."
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>

              <p className="flex gap-2 text-xs">
                <span className="font-medium">
                  <div>{item.change}</div>
                </span>
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
