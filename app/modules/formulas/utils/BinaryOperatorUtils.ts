import { FormulaEndResult, FormulaOperatorType, FormulaValueType } from "../dtos/FormulaDto";

type BinaryOperatorFn = (leftOperand: FormulaValueType, rightOperand: FormulaValueType) => FormulaEndResult;

const binaryOperators: Record<FormulaOperatorType, BinaryOperatorFn> = {
  ADD: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      if (a !== null) return a as number;
      return 0;
    } else if (typeof a === "number" && typeof b === "number") {
      return a + b;
    } else if (typeof a === "string" || typeof b === "string") {
      return Number(a) + Number(b);
    } else if (typeof a === "boolean" && typeof b === "boolean") {
      return a || b;
    } else if (a instanceof Date && typeof b === "number") {
      const newDate = new Date(a);
      newDate.setDate(newDate.getDate() + b);
      return newDate;
    } else {
      return 0;
    }
  },
  SUBTRACT: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      if (a !== null) return a as number;
      return 0;
    } else if (typeof a === "number" && typeof b === "number") {
      return a - b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a.replace(b, "");
    } else if (typeof a === "boolean" && typeof b === "boolean") {
      return a && !b;
    } else if (a instanceof Date && typeof b === "number") {
      const newDate = new Date(a);
      newDate.setDate(newDate.getDate() - b);
      return newDate;
    } else {
      return 0;
    }
  },
  MULTIPLY: (a: FormulaValueType, b: FormulaValueType) => (a !== null && b !== null ? Number(a) * Number(b) : false),
  DIVIDE: (a: FormulaValueType, b: FormulaValueType) => (a !== null && b !== null && b !== 0 ? Number(a) / Number(b) : false),
  CONCAT: (a: FormulaValueType, b: FormulaValueType) => (a?.toString() ?? "") + (b?.toString() ?? ""),
  EQUALS: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      return false;
    } else if (typeof a === "number" && typeof b === "number") {
      return a === b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a === b;
    } else if (typeof a === "boolean" && typeof b === "boolean") {
      return a === b;
    } else if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    } else {
      return false;
    }
  },
  NOT_EQUALS: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      return false;
    } else if (typeof a === "number" && typeof b === "number") {
      return a !== b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a !== b;
    } else if (typeof a === "boolean" && typeof b === "boolean") {
      return a !== b;
    } else if (a instanceof Date && b instanceof Date) {
      return a.getTime() !== b.getTime();
    } else {
      return false;
    }
  },
  GREATER_THAN: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      return false;
    } else if (typeof a === "number" && typeof b === "number") {
      return a > b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a > b;
    } else if (a instanceof Date && b instanceof Date) {
      return a.getTime() > b.getTime();
    } else {
      return false;
    }
  },
  LESS_THAN: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      return false;
    } else if (typeof a === "number" && typeof b === "number") {
      return a < b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a < b;
    } else if (a instanceof Date && b instanceof Date) {
      return a.getTime() < b.getTime();
    } else {
      return false;
    }
  },
  GREATER_THAN_OR_EQUAL: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      return false;
    } else if (typeof a === "number" && typeof b === "number") {
      return a >= b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a >= b;
    } else if (a instanceof Date && b instanceof Date) {
      return a.getTime() >= b.getTime();
    } else {
      return false;
    }
  },
  LESS_THAN_OR_EQUAL: (a: FormulaValueType, b: FormulaValueType) => {
    if (a === null || b === null) {
      return false;
    } else if (typeof a === "number" && typeof b === "number") {
      return a <= b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a <= b;
    } else if (a instanceof Date && b instanceof Date) {
      return a.getTime() <= b.getTime();
    } else {
      return false;
    }
  },
  AND: (a: FormulaValueType, b: FormulaValueType) => {
    if (typeof a === "boolean" && typeof b === "boolean") {
      return a && b;
    } else {
      let aIsTrue = (a || a === "true") && a !== "false";
      let bIsTrue = (b || b === "true") && b !== "false";
      return aIsTrue && bIsTrue;
    }
  },
  OR: (a: FormulaValueType, b: FormulaValueType) => Boolean(a || b),
  NOT: (a: FormulaValueType) => !a,
  DATE_ADD_DAYS: (a: FormulaValueType, b: FormulaValueType) => {
    if (a instanceof Date || typeof a === "string") {
      const newDate = new Date(a);
      newDate.setDate(newDate.getDate() + Number(b ?? 0));
      return newDate;
    } else {
      return null;
    }
  },
};

export default {
  binaryOperators,
};
