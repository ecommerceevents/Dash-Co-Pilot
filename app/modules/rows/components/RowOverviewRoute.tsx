import { Fragment, ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutlet, useSearchParams, useParams } from "@remix-run/react";
import RowActivity from "~/components/entities/rows/RowActivity";
import RowForm from "~/components/entities/rows/RowForm";
import RowTags from "~/components/entities/rows/RowTags";
import RowTasks from "~/components/entities/rows/RowTasks";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getEntityPermission, getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import clsx from "clsx";
import { useTypedActionData } from "remix-typedjson";
import { Rows_Overview } from "../routes/Rows_Overview.server";
import toast from "react-hot-toast";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import RowOverviewHeader from "~/components/entities/rows/RowOverviewHeader";

type EditRowOptions = {
  hideTitle?: boolean;
  hideMenu?: boolean;
  hideShare?: boolean;
  hideTags?: boolean;
  hideTasks?: boolean;
  hideActivity?: boolean;
  disableUpdate?: boolean;
  disableDelete?: boolean;
};

interface Props {
  rowData: RowsApi.GetRowData;
  item: RowWithDetails;
  // permissions: RowPermission[];
  routes?: EntitiesApi.Routes;
  children?: ReactNode;
  title?: ReactNode;
  rowFormChildren?: ReactNode;
  afterRowForm?: ReactNode;
  options?: EditRowOptions;
  relationshipRows?: RowsApi.GetRelationshipRowsData;
  onSubmit?: (formData: FormData) => void;
}
export default function RowOverviewRoute({
  rowData,
  item,
  routes,
  children,
  title,
  rowFormChildren,
  afterRowForm,
  options,
  relationshipRows,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const actionData = useTypedActionData<Rows_Overview.ActionData>();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData?.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, t]);

  return (
    <>
      <EditPageLayout
        title={options?.hideTitle ? "" : t(rowData.entity.title)}
        menu={
          options?.hideMenu || !routes
            ? undefined
            : EntityHelper.getLayoutBreadcrumbsMenu({
                type: "overview",
                t,
                appOrAdminData,
                entity: rowData.entity,
                item: rowData.item,
                params,
                routes,
              })
        }
        withHome={false}
      >
        <EditRow
          rowData={rowData}
          className="mx-auto pb-10"
          item={item}
          routes={routes}
          title={title}
          options={options}
          rowFormChildren={rowFormChildren}
          afterRowForm={afterRowForm}
          onSubmit={onSubmit}
          relationshipRows={relationshipRows}
          actionData={actionData}
        >
          {children}
        </EditRow>
      </EditPageLayout>

      <SlideOverWideEmpty
        title={""}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>

      <ActionResultModal actionData={actionData} showSuccess={false} showError={false} />
    </>
  );
}

interface EditRowProps {
  rowData: RowsApi.GetRowData;
  item: RowWithDetails;
  routes?: EntitiesApi.Routes;
  className: string;
  children?: ReactNode;
  title?: ReactNode;
  options?: EditRowOptions;
  rowFormChildren?: ReactNode;
  afterRowForm?: ReactNode;
  linkedAccounts?: LinkedAccountWithDetailsAndMembers[];
  relationshipRows?: RowsApi.GetRelationshipRowsData;
  onSubmit?: (formData: FormData) => void;
  actionData: Rows_Overview.ActionData | null;
}
function EditRow({
  rowData,
  routes,
  item,
  className,
  title,
  options,
  children,
  rowFormChildren,
  afterRowForm,
  linkedAccounts,
  relationshipRows,
  onSubmit,
  actionData,
}: EditRowProps) {
  const appOrAdminData = useAppOrAdminData();
  const [searchParams] = useSearchParams();

  function canUpdate() {
    if (options?.disableUpdate) {
      // console.log("canUpdate: disableUpdate");
      return false;
    }
    if (!getUserHasPermission(appOrAdminData, getEntityPermission(rowData.entity, "update"))) {
      // console.log("canUpdate: no permission");
      return false;
    }
    if (!rowData.rowPermissions.canUpdate) {
      // console.log("canUpdate: rowPermissions.canUpdate");
      return false;
    }
    return true;
  }
  function isEditing() {
    if (rowData.entity.onEdit === "overviewAlwaysEditable") {
      return true;
    }
    return searchParams.get("editing") !== null;
  }

  return (
    <Fragment>
      {!rowData.rowPermissions.canRead ? (
        <div className="font-medium">You don't have permissions to view this record.</div>
      ) : (
        <div className={className}>
          <RowOverviewHeader rowData={rowData} item={item} canUpdate={canUpdate()} isEditing={isEditing()} routes={routes} title={title} options={options} />
          <div className="mt-4 space-y-4 lg:flex lg:space-x-4 lg:space-y-0">
            <div className={clsx("flex-shrink-0 space-y-4 lg:w-4/6")}>
              {children ?? (
                <RowForm
                  entity={rowData.entity}
                  routes={routes}
                  item={item}
                  editing={isEditing()}
                  linkedAccounts={linkedAccounts}
                  canDelete={false}
                  canUpdate={canUpdate()}
                  allEntities={appOrAdminData.entities}
                  onSubmit={onSubmit}
                  relationshipRows={relationshipRows}
                  promptFlows={rowData.allPromptFlows}
                >
                  {rowFormChildren}
                </RowForm>
              )}

              {afterRowForm}
            </div>
            <div className={clsx("flex-shrink-0 space-y-4 pt-3 lg:w-2/6")}>
              {rowData.entity.hasTags && !options?.hideTags && <RowTags items={rowData.tags} onSetTagsRoute={canUpdate() ? "tags" : undefined} />}
              {rowData.entity.hasTasks && !options?.hideTasks && <RowTasks items={rowData.tasks} />}
              {rowData.entity.hasActivity && rowData.rowPermissions.canComment && !options?.hideActivity && (
                <RowActivity items={rowData.logs} onSubmit={onSubmit} hasComments={rowData.entity.hasComments} />
              )}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}
