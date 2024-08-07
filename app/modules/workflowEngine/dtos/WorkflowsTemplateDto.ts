import { WorkflowBlockType } from "./WorkflowBlockTypes";
import { WorkflowConditionOperator } from "./WorkflowConditionDtos";

export type WorkflowsTemplateDto = {
  title: string;
  workflows: WorkflowTemplateDto[];
  variables?: { name: string; value: string }[];
  credentialsRequired?: string[];
  adminOnly?: boolean;
};

export type WorkflowTemplateDto = {
  name: string;
  description?: string;
  blocks: {
    id: string;
    type: WorkflowBlockType; // "manual" | "api" | "if" | "switch" | "httpRequest" | "log" | "doNothing"
    description?: string;
    input?: { [key: string]: any };
    conditionGroups?: {
      // index: number;
      type: "AND" | "OR";
      case?: string; // switch (case1,case2,default)
      conditions: {
        // index: number;
        variable: string;
        operator: WorkflowConditionOperator; // '=', '!=', '>', '<', '>=', '<=', 'contains', 'doesNotContain', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'
        value: string; // The value to compare against
      }[];
    }[];
  }[];
  toBlocks: {
    fromBlockId: string;
    toBlockId: string;
    condition?: string; // if (true, false), switch (case1,case2,default)
  }[];
  inputExamples: {
    title: string;
    input: { [key: string]: any };
  }[];
};
