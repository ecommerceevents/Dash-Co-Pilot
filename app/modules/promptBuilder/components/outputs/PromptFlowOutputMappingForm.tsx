import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { PromptFlowWithDetails } from "../../db/promptFlows.db.server";
import { PromptFlowOutputWithDetails } from "../../db/promptFlowOutputs.db.server";
import { useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import InputSelector from "~/components/ui/input/InputSelector";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { useTranslation } from "react-i18next";
import { PromptFlowOutputMapping } from "@prisma/client";

export default function PromptFlowOutputMappingForm({
  allEntities,
  promptFlow,
  promptFlowOutput,
  item,
  onDelete,
}: {
  allEntities: EntityWithDetails[];
  promptFlow: PromptFlowWithDetails;
  promptFlowOutput: PromptFlowOutputWithDetails;
  item: PromptFlowOutputMapping | undefined;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [promptTemplateId, setPromptTemplateId] = useState<string | undefined>(item?.promptTemplateId ?? undefined);
  const [propertyId, setPropertyId] = useState<string | undefined>(item?.propertyId ?? undefined);

  function getProperties() {
    const entity = allEntities.find((f) => f.id === promptFlowOutput.entityId);
    return entity?.properties.filter((f) => !f.isDefault) ?? [];
  }
  return (
    <Form method="post">
      <input type="hidden" name="action" value={item ? "edit" : "new"} />
      <div>
        <div className="mt-4 space-y-2">
          <InputSelector
            withSearch={false}
            name="promptTemplateId"
            title="Prompt Template"
            value={promptTemplateId}
            setValue={(e) => setPromptTemplateId(e?.toString() ?? undefined)}
            options={promptFlow.templates.map((f) => {
              return {
                name: f.title,
                value: f.id,
              };
            })}
            required
          />

          <InputSelector
            withSearch={false}
            name="propertyId"
            title={`${t(promptFlowOutput.entity.title)} - ${t("models.property.object")}`}
            value={propertyId}
            setValue={(e) => setPropertyId(e?.toString() ?? undefined)}
            options={getProperties().map((f) => {
              return {
                name: `${t(f.title)} (${f.name})`,
                value: f.id,
              };
            })}
            required
          />
        </div>

        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {onDelete && (
              <ButtonSecondary disabled={navigation.state === "submitting"} type="button" className="w-full" onClick={onDelete} destructive>
                <div>{"Delete"}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            <LoadingButton actionName={item ? "edit" : "new"} type="submit" disabled={navigation.state === "submitting"}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </div>
    </Form>
  );
}

// function EntityProperties({
//   allEntities,
//   entityId,
//   state,
//   setState,
// }: {
//   allEntities: EntityWithDetails[];
//   entityId: string;
//   state: { id: string; name: string; title: string } | null;
//   setState: (state: { id: string; name: string; title: string } | null) => void;
// }) {
//   const entity = allEntities.find((f) => f.id === entityId);
//   const [property, setProperty] = useState<{ id: string; name: string; title: string } | null>(state);

//   useEffect(() => {
//     setState(property);
//   }, [property]);

//   if (!entity) {
//     return null;
//   }
//   return (
//     <InputSelector
//       withSearch={false}
//       title="Property"
//       value={property?.id}
//       setValue={(e) => {
//         const property = entity.properties.find((f) => f.id === e);
//         setProperty(property ?? null);
//       }}
//       options={entity.properties.map((f) => {
//         return { name: f.name, value: f.id };
//       })}
//     />
//   );
// }
