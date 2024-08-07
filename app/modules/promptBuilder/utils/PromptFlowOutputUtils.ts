import { PromptFlowOutputWithDetails } from "../db/promptFlowOutputs.db.server";
import { PromptFlowOutputTypes } from "../dtos/PromptFlowOutputType";

function getOutputTitle(item: PromptFlowOutputWithDetails) {
  const type = PromptFlowOutputTypes.find((f) => f.value === item.type);
  return type ? type.name : item.type;
}

export default {
  getOutputTitle,
};
