import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, title, plural } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [
    `import { useActionData, useOutlet, useNavigate, useLocation, useSearchParams, useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import RowSettingsTabs from "~/components/entities/rows/RowSettingsTabs";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import NumberUtils from "~/utils/shared/NumberUtils";
import ShareIcon from "~/components/ui/icons/ShareIcon";
import ClockIcon from "~/components/ui/icons/ClockIcon";
import PencilIcon from "~/components/ui/icons/PencilEmptyIcon";
import { useTypedLoaderData } from "remix-typedjson";`,
  ];

  if (entity.hasTasks) {
    imports.push(`import RowTasks from "~/components/entities/rows/RowTasks";`);
  }
  if (entity.hasTags) {
    imports.push(`import RowTags from "~/components/entities/rows/RowTags";`);
  }

  imports.push(`import ${capitalized}Form from "../../components/${capitalized}Form";
import { ${capitalized}RoutesEditApi } from "../api/${capitalized}Routes.Edit.Api";`);

  let template = `
export default function ${capitalized}RoutesEditView() {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const data = useTypedLoaderData<${capitalized}RoutesEditApi.LoaderData>();
  const actionData = useActionData<${capitalized}RoutesEditApi.ActionData>();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  function canUpdate() {
    return data.permissions.canUpdate;
  }
  function canDelete() {
    return data.permissions.canDelete;
  }

  return (
    <EditPageLayout
      title={t("shared.edit") + " " + t("${title}")}
      menu={[
        {
          title: t("${plural}"),
          routePath: UrlUtils.getParentRoute(location?.pathname),
        },
        {
          title: t("shared.edit"),
          routePath: "",
        },
      ]}
    >
      <div className="relative items-center justify-between space-y-2 border-b border-gray-200 pb-4 sm:flex sm:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="text-xl font-bold uppercase">
            {data.item.prefix}-{NumberUtils.pad(data.item.row.folio ?? 0, 4)}
          </div>
        </div>
        <div className="flex space-x-2">
          <ButtonSecondary to="activity">
            <ClockIcon className="h-4 w-4 text-gray-500" />
          </ButtonSecondary>
           {data.permissions.isOwner && (
            <ButtonSecondary to="share">
              <ShareIcon className="h-4 w-4 text-gray-500" />
            </ButtonSecondary>
          )}
          {canUpdate() && (
            <ButtonSecondary
              onClick={() => {
                if (searchParams.get("view") === "edit") {
                  setSearchParams({});
                } else {
                  searchParams.set("view", "edit");
                  setSearchParams(searchParams);
                }
              }}
            >
              <PencilIcon className="h-4 w-4 text-gray-500" />
            </ButtonSecondary>
          )}
        </div>
      </div>

      {!data.item ? (
        <div>{t("shared.loading")}...</div>
      ) : (
        <div className="mx-auto space-y-2 pt-2 lg:flex lg:space-x-4 lg:space-y-0 pb-10">
          <div className="space-y-4 lg:w-4/6">
            <${capitalized}Form
              item={data.item}
              actionData={actionData}
              canUpdate={canUpdate()}
              canDelete={canDelete()}
              isUpdating={searchParams.get("view") === "edit"}
              onCancel={() => {
                setSearchParams({});
              }}
            />
          </div>

          <div className="space-y-4 lg:w-2/6">
            ${entity.hasTags ? `<RowTags items={data.item.row.tags} onSetTagsRoute={canUpdate() ? "tags" : undefined} />` : ""}
            ${entity.hasTasks ? `<RowTasks items={data.tasks} />` : ""}
          </div>
        </div>
      )}

      <SlideOverWideEmpty
        withTitle={false}
        withClose={false}
        title={""}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            <RowSettingsTabs canUpdate={canUpdate()} isOwner={data.permissions.isOwner} hasTags={${entity.hasTags ? "true" : "false"}} />
            {outlet}
          </div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}`;

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
