import { PromptFlowOutputType } from "./PromptFlowOutputType";

export type PromptFlowOutputDto = {
  type: PromptFlowOutputType;
  entityId: string;
  outputs: PromptTemplateOutputTemplateDto[];

  // createEntityId: string | null;
  // createParentId: string | null;
  // createChildId: string | null;
  // createEntity: { id: string; name: string; title: string } | null;
  // createParent: { id: string; parent: { id: string; name: string; title: string } } | null;
  // createChild: { id: string; child: { id: string; name: string; title: string } } | null;
};

export type PromptTemplateOutputTemplateDto = {
  promptTemplateId: string;
  promptTemplate: { id: string; title: string };
  propertyId: string;
  property: { id: string; name: string; title: string };
};
