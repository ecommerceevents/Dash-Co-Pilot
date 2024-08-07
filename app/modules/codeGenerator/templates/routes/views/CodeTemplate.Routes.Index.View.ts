import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import CodeGeneratorPropertiesHelper from "~/modules/codeGenerator/utils/CodeGeneratorPropertiesHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, plural } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  imports.push(`import { useActionData, useSearchParams, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RowCreatedByCell from "~/components/entities/rows/cells/RowCreatedByCell";
import RowFolioCell from "~/components/entities/rows/cells/RowFolioCell";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import DateCell from "~/components/ui/dates/DateCell";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useTypedLoaderData } from "remix-typedjson";`);
  imports.push(`import ${capitalized}Form from "../../components/${capitalized}Form";
import { ${capitalized}Dto } from "../../dtos/${capitalized}Dto";
import { ${capitalized}RoutesIndexApi } from "../api/${capitalized}Routes.Index.Api";`);

  let template = `
export default function ${capitalized}RoutesIndexView() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<${capitalized}RoutesIndexApi.LoaderData>();
  const actionData = useActionData<{ error?: string; success?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [overviewItem, setOverviewItem] = useState<${capitalized}Dto>();

  useEffect(() => {
    setOverviewItem(data.overviewItem ?? undefined);
  }, [data.overviewItem]);

  return (
    <IndexPageLayout
      title={t("${plural}")}
      buttons={
        <>
          {!!data.filterableProperties?.length && <InputFilters filters={data.filterableProperties} />}
          <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={data.items}
        pagination={data.pagination}
        actions={[
          {
            title: t("shared.overview"),
            onClick: (_, item) => {
              searchParams.set("overview", item.row.id);
              setSearchParams(searchParams);
            },
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => item.row.id,
          },
        ]}
        headers={[
          {
            name: "folio",
            title: t("models.row.folio"),
            value: (item) => <RowFolioCell prefix={item.prefix} folio={item.row.folio} href={item.row.id} />,
          },
          {PROPERTIES_UI_CELLS}
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => <DateCell date={item.row.createdAt} />,
            className: "text-gray-400 text-xs",
            breakpoint: "sm",
          },
          {
            name: "createdByUser",
            title: t("shared.createdBy"),
            value: (item) => <RowCreatedByCell user={item.row.createdByUser} apiKey={item.row.createdByApiKey} />,
            className: "text-gray-400 text-xs",
            breakpoint: "sm",
          },
        ]}
      />
      <SlideOverWideEmpty
        withTitle={false}
        withClose={false}
        title={t("${capitalized}")}
        open={!!searchParams.get("overview")?.toString()}
        onClose={() => {
          searchParams.delete("overview");
          setSearchParams(searchParams);
          setTimeout(() => {
            setOverviewItem(undefined);
          }, 100);
        }}
        className="sm:max-w-md"
        buttons={
          <>
            <Link
              to={overviewItem?.row.id ?? ""}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close panel</span>
              <ExternalLinkEmptyIcon className="h-6 w-6" aria-hidden="true" />
            </Link>
          </>
        }
      >
        {!overviewItem ? <div>{t("shared.loading")}...</div> : <${capitalized}Form item={overviewItem} actionData={actionData} />}
      </SlideOverWideEmpty>
    </IndexPageLayout>
  );
}
`;

  const uiCellControls: string[] = [];
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property) => {
      CodeGeneratorPropertiesHelper.uiCell({ code: uiCellControls, imports, property });
    });
  template = template.replace("{PROPERTIES_UI_CELLS}", uiCellControls.join("\n          "));

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
