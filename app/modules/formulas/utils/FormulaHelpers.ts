import { FormulaWithDetails } from "../db/formulas.db.server";
import {
  FormulaResultAsType,
  FormulaOperatorType,
  FormulaParenthesisType,
  FormulaCalculationTriggerType,
  FormulaDto,
  FormulaValueType,
  FormulaComponentType,
} from "../dtos/FormulaDto";

function getFormulaDto(formula: FormulaWithDetails) {
  const formulaDto: FormulaDto = {
    id: formula.id,
    createdAt: formula.createdAt,
    name: formula.name,
    description: formula.description,
    resultAs: getResultAs(formula.resultAs),
    calculationTrigger: getCalculationTrigger(formula.calculationTrigger),
    withLogs: formula.withLogs,
    components: formula.components
      .sort((a, b) => a.order - b.order)
      .map((component) => ({
        order: component.order,
        type: getComponentType(component.type),
        value: component.value ?? undefined,
      })),
    inProperties: formula.inProperties.map((x) => ({
      id: x.id,
      name: x.name,
      entity: {
        id: x.entity.id,
        name: x.entity.name,
      },
    })),
  };
  return formulaDto;
}

function getResultAs(resultAs?: string): FormulaResultAsType {
  switch (resultAs) {
    case "number":
      return "number";
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "date":
      return "date";
    default:
      return "string";
  }
}

function getComponentType(type: string): FormulaComponentType {
  switch (type) {
    case "variable":
      return "variable";
    case "operator":
      return "operator";
    case "value":
      return "value";
    case "parenthesis":
      return "parenthesis";
    default:
      return "variable";
  }
}

function getCalculationTrigger(calculationTrigger?: string): FormulaCalculationTriggerType {
  switch (calculationTrigger) {
    case "ALWAYS":
      return "ALWAYS";
    case "BEFORE_LISTED":
      return "BEFORE_LISTED";
    case "AFTER_CREATED":
      return "AFTER_CREATED";
    case "BEFORE_VIEWED":
      return "BEFORE_VIEWED";
    case "AFTER_UPDATED":
      return "AFTER_UPDATED";
    case "IF_UNSET":
      return "IF_UNSET";
    case "NEVER":
      return "NEVER";
    default:
      return "NEVER";
  }
}

function getOperatorType(operator: string): FormulaOperatorType {
  switch (operator) {
    case "ADD":
      return "ADD";
    case "SUBTRACT":
      return "SUBTRACT";
    case "MULTIPLY":
      return "MULTIPLY";
    case "DIVIDE":
      return "DIVIDE";
    case "CONCAT":
      return "CONCAT";
    case "EQUALS":
      return "EQUALS";
    case "NOT_EQUALS":
      return "NOT_EQUALS";
    case "GREATER_THAN":
      return "GREATER_THAN";
    case "LESS_THAN":
      return "LESS_THAN";
    case "GREATER_THAN_OR_EQUAL":
      return "GREATER_THAN_OR_EQUAL";
    case "LESS_THAN_OR_EQUAL":
      return "LESS_THAN_OR_EQUAL";
    case "AND":
      return "AND";
    case "OR":
      return "OR";
    case "NOT":
      return "NOT";
    case "DATE_ADD_DAYS":
      return "DATE_ADD_DAYS";
    default:
      return "ADD";
  }
}

function getOperatorSymbol(operator?: string): string {
  switch (getOperatorType(operator ?? "")) {
    case "ADD":
      return "+";
    case "DATE_ADD_DAYS":
      return "+";
    case "SUBTRACT":
      return "-";
    case "MULTIPLY":
      return "*";
    case "DIVIDE":
      return "/";
    case "CONCAT":
      return "&";
    case "EQUALS":
      return "=";
    case "NOT_EQUALS":
      return "!=";
    case "GREATER_THAN":
      return ">";
    case "LESS_THAN":
      return "<";
    case "GREATER_THAN_OR_EQUAL":
      return ">=";
    case "LESS_THAN_OR_EQUAL":
      return "<=";
    case "AND":
      return "AND";
    case "OR":
      return "OR";
    case "NOT":
      return "NOT";
    default:
      return "";
  }
}

function getParenthesisType(parenthesis: string): FormulaParenthesisType {
  switch (parenthesis) {
    case "OPEN":
      return "OPEN";
    case "CLOSE":
      return "CLOSE";
    default:
      return "OPEN";
  }
}

function getValueAsString(value: FormulaValueType) {
  let valueStr = "";
  if (value === null) {
    valueStr = "[null]";
  } else if (value === undefined) {
    valueStr = "[undefined]";
  } else if (typeof value === "string") {
    valueStr = `"${value}"`;
  } else if (typeof value === "boolean") {
    valueStr = `${value ? "true" : "false"}`;
  } else if (typeof value === "number") {
    valueStr = `${value}`;
  } else if (value instanceof Date) {
    valueStr = `"${value.toISOString()}"`;
  } else {
    valueStr = `"${value.toString()}"`;
  }
  return valueStr;
}

export default {
  getFormulaDto,
  getResultAs,
  getComponentType,
  getCalculationTrigger,
  getOperatorType,
  getOperatorSymbol,
  getParenthesisType,
  getValueAsString,
};
