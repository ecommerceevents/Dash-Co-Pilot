import { Decimal } from "decimal.js";

export type FormulaDto = {
  id?: string;
  name: string;
  description: string | null;
  components: FormulaComponentDto[];
  resultAs?: FormulaResultAsType;
  calculationTrigger?: FormulaCalculationTriggerType;
  withLogs?: boolean;
  createdAt?: Date;
  inProperties?: { id: string; name: string; entity: { id: string; name: string } }[];
};

export const FormulaCalculationTriggerTypes = ["ALWAYS", "NEVER", "BEFORE_LISTED", "AFTER_CREATED", "BEFORE_VIEWED", "AFTER_UPDATED", "IF_UNSET"] as const;
export type FormulaCalculationTriggerType = (typeof FormulaCalculationTriggerTypes)[number];
export const FormulaResultAsTypes = ["number", "boolean", "string", "date"] as const;
export type FormulaResultAsType = (typeof FormulaResultAsTypes)[number];

export const FormulaOperatorTypes = [
  "ADD",
  "SUBTRACT",
  "MULTIPLY",
  "DIVIDE",
  "CONCAT",
  "EQUALS",
  "NOT_EQUALS",
  "GREATER_THAN",
  "LESS_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN_OR_EQUAL",
  "AND",
  "OR",
  "NOT",
  "DATE_ADD_DAYS",
] as const;
export type FormulaOperatorType = (typeof FormulaOperatorTypes)[number];
export type FormulaParenthesisType = "OPEN" | "CLOSE";

type RowMedia = {};
type RowValueMultiple = { order: number; value: string };
type RowValueRange = { numberMin: Decimal | null; numberMax: Decimal | null; dateMin: Date | null; dateMax: Date | null };
export type FormulaValueType = string | number | boolean | RowMedia[] | RowValueMultiple[] | RowValueRange | Date | null;
export type FormulaEndResult = string | number | boolean | Date | null;

export const FormulaComponentTypes = [
  { value: "variable", name: "Variable" },
  { value: "operator", name: "Operator" },
  { value: "parenthesis", name: "Parenthesis" },
  { value: "value", name: "Value" },
] as const;
export type FormulaComponentType = (typeof FormulaComponentTypes)[number]["value"];
export type FormulaComponentDto = {
  order: number;
  type: FormulaComponentType;
  value: string;
};
