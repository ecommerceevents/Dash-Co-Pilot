import { useSearchParams } from "@remix-run/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import Constants from "~/application/Constants";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";

export default function RowsLoadMoreCard({
  pagination,
  currentView,
  className,
}: {
  pagination?: PaginationDto;
  currentView?: EntityViewWithDetails | null;
  className?: string;
}) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  function theresMore() {
    if (!pagination) {
      return false;
    }
    return pagination.totalItems > pagination.page * pagination.pageSize;
  }
  return (
    <Fragment>
      {theresMore() && (
        <div className={className}>
          <button
            type="button"
            className="group inline-block h-full w-full truncate rounded-md border-2 border-dashed border-slate-200 p-4 text-left align-middle shadow-sm hover:border-dotted hover:border-slate-300 hover:bg-slate-100"
            onClick={() => {
              if (!pagination) {
                return;
              }
              let currentPageSize = 0;
              const paramsPageSize = searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize") ?? "") : undefined;
              if (paramsPageSize) {
                currentPageSize = paramsPageSize;
              } else {
                currentPageSize = pagination.pageSize;
              }
              let currentViewPageSize = currentView ? currentView.pageSize : 0;
              if (currentViewPageSize === 0) {
                currentViewPageSize = Constants.DEFAULT_PAGE_SIZE;
              }
              const pageSize = currentPageSize + currentViewPageSize;
              searchParams.set("pageSize", pageSize.toString());
              setSearchParams(searchParams);
            }}
          >
            <div className="mx-auto flex justify-center text-center align-middle text-sm font-medium text-gray-700">{t("shared.loadMore")}</div>
          </button>
        </div>
      )}
    </Fragment>
  );
}
