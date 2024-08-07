import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import MonacoEditor, { MonacoAutoCompletion } from "~/components/editors/MonacoEditor";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  allEntities: EntityWithDetails[];
};
export const loader = async () => {
  const allEntities = await getAllEntities({ tenantId: null, active: true });
  const data: LoaderData = {
    allEntities,
  };
  return json(data);
};

export default function PlaygroundMonacoEditorRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();

  const [value, setValue] = useState("");
  const [autocompletions, setAutocompletions] = useState<MonacoAutoCompletion[]>([]);

  useEffect(() => {
    const autocompletions: MonacoAutoCompletion[] = [];
    data.allEntities
      .sort((a, b) => a.order - b.order)
      .forEach((entity) => {
        // autocompletions.push({
        //   label: `row.${entity.name}`,
        //   kind: monaco.languages.CompletionItemKind.Text,
        //   documentation: t(entity.titlePlural),
        //   insertText: `"${entity.name}": "*"`,
        //   range: range,
        // });

        entity.properties
          .filter((f) => !f.isDefault)
          .sort((a, b) => a.order - b.order)
          .forEach((property) => {
            const label = `row.${entity.name}.${property.name}`;
            autocompletions.push({
              label,
              kind: "Value",
              documentation: t(property.title),
              insertText: `{{${label}}}`,
            });
          });

        entity.childEntities.forEach((child) => {
          const childEntity = data.allEntities.find((f) => f.id === child.childId);
          if (!childEntity) {
            return;
          }
          childEntity.properties
            .filter((f) => !f.isDefault)
            .sort((a, b) => a.order - b.order)
            .forEach((property) => {
              const label = `row.${entity.name}.${childEntity.name}.${property.name}`;
              autocompletions.push({
                label,
                kind: "Value",
                documentation: t(property.title),
                insertText: `{{${label}}}`,
                // range: range,
              });
            });
        });
      });
    setAutocompletions(autocompletions);
  }, [data.allEntities, t]);

  return (
    <div className="h-[calc(100vh-100px)]">
      <MonacoEditor theme="vs-dark" fontSize={15} value={value} onChange={(e) => setValue(e)} autocompletions={autocompletions} />
    </div>
  );
}
