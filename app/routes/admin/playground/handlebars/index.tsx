import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { getTranslations } from "~/locale/i18next.server";
import PromptTemplateEditors from "~/modules/promptBuilder/components/templates/PromptTemplateEditors";
import SelectEntityRowSelectors from "~/modules/promptBuilder/components/templates/SelectEntityRowSelectors";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import { getAllRows } from "~/utils/db/entities/rows.db.server";
import TemplateApiHelper, { RowAsJson } from "~/utils/helpers/TemplateApiHelper";
import TemplateApiService from "~/utils/helpers/.server/TemplateApiService";

type LoaderData = {
  items: RowAsJson[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const entities = await getAllEntities({ tenantId: null });
  const items: RowAsJson[] = [];
  for (const entity of entities) {
    const rows = await getAllRows(entity.id);
    for (const row of rows) {
      const rowAsJson = await TemplateApiService.getRowInApiFormatWithRecursiveRelationships({
        entities,
        rowId: row.id,
        t,
        options: {
          exclude: ["id", "folio", "createdAt", "updatedAt", "createdByUser", "createdByApiKey"],
        },
      });
      if (rowAsJson) {
        items.push(rowAsJson);
      }
    }
  }
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const data = useTypedLoaderData<LoaderData>();
  const [templateDto, setTemplateDto] = useState<{
    source: string;
    template: string;
    result: string;
  }>({
    source: "",
    template: "",
    result: "",
  });
  const [row, setRow] = useState<RowAsJson | null>(null);

  useEffect(() => {
    // let object: any = {};
    // if (row) {
    //   object = { ...object, row: row.data };
    // }
    let variables: { [key: string]: string } = {};
    setTemplateDto({
      ...templateDto,
      source: JSON.stringify(
        TemplateApiHelper.getTemplateValue({
          allEntities: appOrAdminData.entities,
          session: {
            user: appOrAdminData.user,
            tenant: row?.tenant ?? null,
          },
          t,
          row: row ?? undefined,
          variables,
        }),
        null,
        2
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  return (
    <div className="space-y-2 p-2">
      <SelectEntityRowSelectors rows={data.items} onChange={(row) => setRow(row)} />
      <PromptTemplateEditors value={templateDto} onChange={(value) => setTemplateDto(value)} promptFlow={undefined} sampleSourceRow={row} />
    </div>
  );
}
