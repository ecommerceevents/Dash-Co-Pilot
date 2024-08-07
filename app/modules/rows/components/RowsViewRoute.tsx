import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import RowsList from "~/components/entities/rows/RowsList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputFilters, { FilterDto } from "~/components/ui/input/InputFilters";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { useAppData } from "~/utils/data/useAppData";
import EntityViewForm from "~/components/entities/views/EntityViewForm";
import { UserSimple } from "~/utils/db/users.db.server";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { useTypedActionData } from "remix-typedjson";
import { Rows_List } from "../routes/Rows_List.server";
import { toast } from "sonner";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import RunPromptFlowButtons from "~/modules/promptBuilder/components/run/RunPromptFlowButtons";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import clsx from "clsx";

interface Props {
  title?: ReactNode;
  rowsData: RowsApi.GetRowsData;
  items: RowWithDetails[];
  routes?: EntitiesApi.Routes;
  onNewRow?: () => void;
  onEditRow?: (item: RowWithDetails) => void;
  saveCustomViews?: boolean;
  permissions: {
    create: boolean;
  };
  currentSession: {
    user: UserSimple;
    isSuperAdmin: boolean;
  } | null;
}
export default function RowsViewRoute({ title, rowsData, items, routes, onNewRow, onEditRow, saveCustomViews, permissions, currentSession }: Props) {
  const { t } = useTranslation();
  const actionData = useTypedActionData<Rows_List.ActionData>();
  const appData = useAppData();
  const submit = useSubmit();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const confirmDeleteRows = useRef<RefConfirmModal>(null);

  const [bulkActions, setBulkActions] = useState<string[]>([]);

  const [view, setView] = useState(rowsData.currentView?.layout ?? searchParams.get("view") ?? "table");
  const [filters, setFilters] = useState<FilterDto[]>([]);

  const [showCustomViewModal, setShowCustomViewModal] = useState(false);
  const [editingView, setEditingView] = useState<EntityViewWithDetails | null>(null);

  const [selectedRows, setSelectedRows] = useState<RowWithDetails[]>([]);

  useEffect(() => {
    setFilters(EntityHelper.getFilters({ t, entity: rowsData.entity, pagination: rowsData.pagination }));
    const bulkActions: string[] = [];
    if (rowsData.entity.hasBulkDelete) {
      bulkActions.push("bulk-delete");
    }
    setBulkActions(bulkActions);
  }, [rowsData, t]);

  useEffect(() => {
    const newView = rowsData.currentView?.layout ?? searchParams.get("view") ?? "table";
    setView(newView);
  }, [searchParams, rowsData.entity, rowsData.currentView?.layout]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
      setSelectedRows([]);
    } else if (actionData?.rowsDeleted) {
      setSelectedRows((rows) => rows.filter((row) => !actionData?.rowsDeleted?.includes(row.id)));
    }
    if (actionData?.updatedView) {
      setShowCustomViewModal(false);
      setEditingView(null);
    }
  }, [actionData]);

  useEffect(() => {
    setShowCustomViewModal(false);
    setEditingView(null);
  }, [searchParams]);

  function onCreateView() {
    setShowCustomViewModal(true);
    setEditingView(null);
  }

  function onUpdateView() {
    setShowCustomViewModal(true);
    setEditingView(rowsData.currentView);
  }

  function isCurrenView(view: EntityViewWithDetails) {
    return rowsData.currentView?.id === view.id;
  }

  function canUpdateCurrentView() {
    if (currentSession?.isSuperAdmin) {
      return true;
    }
    if (!rowsData.currentView) {
      return false;
    }
    if (rowsData.currentView.userId === currentSession?.user.id) {
      return true;
    }
    if (appData?.currentTenant?.id && rowsData.currentView.tenantId === appData?.currentTenant.id && appData?.isSuperUser) {
      return true;
    }
    return false;
  }

  function onDeleteSelectedRows() {
    confirmDeleteRows.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteSelectedRowsConfirmed() {
    const form = new FormData();
    form.set("action", "bulk-delete");
    selectedRows.forEach((item) => {
      form.append("rowIds[]", item.id);
    });
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="flex items-center justify-between space-x-2 md:py-2">
        {selectedRows.length > 0 ? (
          <div className="flex space-x-1">{bulkActions.includes("bulk-delete") && <DeleteIconButton onClick={onDeleteSelectedRows} />}</div>
        ) : (
          <Fragment>
            {rowsData.views.length > 1 ? (
              <TabsWithIcons
                className="flex-grow xl:flex"
                tabs={rowsData.views.map((item) => {
                  // if (views.find((f) => f.name === item.name && f.isDefault)) {
                  //   searchParams.delete("v");
                  // } else {
                  searchParams.set("v", item.name);
                  // }
                  searchParams.delete("page");
                  return {
                    name: t(item.title),
                    href: location.pathname + "?" + searchParams.toString(),
                    current: isCurrenView(item),
                  };
                })}
              />
            ) : (
              title ?? <h3 className="flex flex-1 items-center truncate font-bold">{t(rowsData.currentView?.title ?? rowsData.entity.titlePlural)}</h3>
            )}
          </Fragment>
        )}
        <div className="flex items-center space-x-1">
          {filters.length > 0 && <InputFilters filters={filters} />}
          <RunPromptFlowButtons type="list" promptFlows={rowsData.promptFlows} className="p-0.5" />
          {permissions.create && (
            <ButtonPrimary disabled={!permissions.create} to={!onNewRow ? "new" : undefined} onClick={onNewRow}>
              <span className="sm:text-sm">+</span>
            </ButtonPrimary>
          )}
        </div>
      </div>

      <div>
        <RowsList
          view={view as "table" | "board" | "grid" | "card"}
          entity={rowsData.entity}
          items={items}
          routes={routes}
          pagination={rowsData.pagination}
          onEditRow={onEditRow}
          currentView={rowsData.currentView}
          selectedRows={selectedRows}
          onSelected={!bulkActions.length ? undefined : (rows) => setSelectedRows(rows)}
        />
        <div className="mt-2 flex items-center justify-between space-x-2">
          <div>
            <div className="hidden sm:block">
              {rowsData.pagination && rowsData.pagination.totalItems > 0 && routes && (
                <Link
                  className="text-xs font-medium text-gray-500 hover:underline"
                  to={EntityHelper.getRoutes({ routes, entity: rowsData.entity })?.export + "?" + searchParams}
                  reloadDocument
                >
                  {rowsData.pagination.totalItems === 1 ? (
                    <div>{t("shared.exportResult")}</div>
                  ) : (
                    <div>{t("shared.exportResults", { 0: rowsData.pagination.totalItems })}</div>
                  )}
                </Link>
              )}
            </div>
          </div>

          {saveCustomViews && rowsData.entity.hasViews && (
            <Fragment>
              {canUpdateCurrentView() ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <button type="button" className="text-xs font-medium hover:underline" disabled={!canUpdateCurrentView()} onClick={onUpdateView}>
                    {t("models.view.actions.update")}
                  </button>
                  <div>•</div>
                  <button type="button" className="text-xs font-medium hover:underline" onClick={onCreateView}>
                    {t("models.view.actions.create")}
                  </button>
                </div>
              ) : (
                <button type="button" className="text-xs font-medium text-gray-500 hover:underline" onClick={onCreateView}>
                  {t("models.view.actions.create")}
                </button>
              )}
            </Fragment>
          )}
        </div>
      </div>
      <Outlet />

      <ConfirmModal ref={confirmDeleteRows} onYes={onDeleteSelectedRowsConfirmed} />

      <div className="z-50">
        <SlideOverWideEmpty
          title={editingView ? "Edit view" : `New ${t(rowsData.entity.title)} view`}
          className="sm:max-w-2xl"
          open={showCustomViewModal}
          onClose={() => setShowCustomViewModal(false)}
        >
          {showCustomViewModal && (
            <EntityViewForm
              entity={rowsData.entity}
              tenantId={appData.currentTenant?.id ?? null}
              userId={currentSession?.user.id ?? null}
              item={editingView}
              canDelete={true}
              onClose={() => setShowCustomViewModal(false)}
              actionNames={{
                create: "view-create",
                update: "view-edit",
                delete: "view-delete",
              }}
              isSystem={false}
              showViewType={currentSession?.isSuperAdmin ?? false}
            />
          )}
        </SlideOverWideEmpty>
      </div>
    </div>
  );
}

function DeleteIconButton({ onClick }: { onClick: () => void }) {
  const navigation = useNavigation();
  return (
    <button
      type="button"
      className={clsx(
        "group flex items-center rounded-md border border-transparent px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        navigation.state === "submitting" && navigation.formData?.get("action") === "bulk-delete" && "base-spinner"
      )}
      disabled={navigation.state !== "idle"}
      onClick={onClick}
    >
      <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
    </button>
  );
}
