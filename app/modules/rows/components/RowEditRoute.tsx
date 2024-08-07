import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "@remix-run/react";
import RowForm from "~/components/entities/rows/RowForm";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getEntityPermission, getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { Rows_Edit } from "../routes/Rows_Edit.server";
import { useTypedLoaderData } from "remix-typedjson";

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
  layout?: "edit" | "simple";
  children?: ReactNode;
  title?: ReactNode;
  rowFormChildren?: ReactNode;
  options?: EditRowOptions;
}

export default function RowEditRoute({ rowFormChildren, options }: Props) {
  const { rowData, routes, allEntities, relationshipRows } = useTypedLoaderData<Rows_Edit.LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();

  return (
    <NewPageLayout
      title={t("shared.edit") + " " + t(rowData.entity.title)}
      menu={EntityHelper.getLayoutBreadcrumbsMenu({ type: "edit", t, appOrAdminData, entity: rowData.entity, item: rowData.item, params, routes })}
    >
      <RowForm
        allEntities={allEntities}
        entity={rowData.entity}
        routes={routes}
        item={rowData.item}
        editing={true}
        canDelete={
          !options?.disableDelete &&
          getUserHasPermission(appOrAdminData, getEntityPermission(rowData.entity, "delete")) &&
          (rowData.rowPermissions.canDelete || appOrAdminData.isSuperUser)
        }
        canUpdate={
          !options?.disableUpdate &&
          getUserHasPermission(appOrAdminData, getEntityPermission(rowData.entity, "update")) &&
          (rowData.rowPermissions.canDelete || appOrAdminData.isSuperUser)
        }
        relationshipRows={relationshipRows}
        onCancel={() => navigate(EntityHelper.getRoutes({ routes, entity: rowData.entity, item: rowData.item })?.overview ?? "")}
        promptFlows={rowData.allPromptFlows}
      >
        {rowFormChildren}
      </RowForm>
      <Outlet />
    </NewPageLayout>
  );
}
