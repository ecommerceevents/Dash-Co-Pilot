import { FormulaOperatorType, FormulaDto, FormulaValueType, FormulaResultAsType, FormulaEndResult } from "../dtos/FormulaDto";
import BinaryOperatorUtils from "./BinaryOperatorUtils";
import FormulaHelpers from "./FormulaHelpers";

function calculateFormula(formula: FormulaDto, values: Record<string, FormulaValueType>): FormulaEndResult {
  const resultAs: FormulaResultAsType = FormulaHelpers.getResultAs(formula.resultAs);
  let lastComponent: string | null = null;
  let result: FormulaValueType | null = null;
  let currentOperand: FormulaValueType = null;
  let currentOperator: FormulaOperatorType | null = null;
  let openParenthesesCount = 0;
  let closeParenthesesCount = 0;
  let insideParentheses: FormulaDto | null = null;

  formula.components.forEach((component) => {
    if (component.type === "variable") {
      lastComponent = "variable: " + component.value;
      if (insideParentheses !== null) {
        insideParentheses.components.push(component);
      } else {
        currentOperand = values[component.value];
      }
    } else if (component.type === "operator") {
      lastComponent = "operator: " + component.value;
      if (currentOperator !== null) {
        if (insideParentheses !== null) {
          insideParentheses.components.push(component);
        } else {
          result = BinaryOperatorUtils.binaryOperators[currentOperator](result, currentOperand);
        }
      } else {
        if (insideParentheses !== null) {
          throw new Error("Invalid formula: parentheses must be used in pairs");
        } else {
          result = currentOperand;
        }
      }
      // Reset the operand for the next iteration
      currentOperand = null;
      currentOperator = FormulaHelpers.getOperatorType(component.value);
    } else if (component.type === "parenthesis") {
      lastComponent = "parenthesis: " + component.value;
      const parenthesis = FormulaHelpers.getParenthesisType(component.value);
      if (parenthesis === "OPEN") {
        if (insideParentheses !== null) {
          throw new Error("Invalid formula: parentheses must be used in pairs");
        } else {
          insideParentheses = { name: "", description: "", resultAs: "number", calculationTrigger: formula.calculationTrigger, components: [] };
          openParenthesesCount++;
        }
      } else if (parenthesis === "CLOSE") {
        if (insideParentheses === null) {
          throw new Error("Invalid formula: parentheses must be used in pairs");
        } else {
          closeParenthesesCount++;
          if (closeParenthesesCount > openParenthesesCount) {
            throw new Error("Invalid formula: parentheses must be used in pairs");
          } else if (closeParenthesesCount === openParenthesesCount) {
            currentOperand = calculateFormula(insideParentheses, values);
            insideParentheses = null;
          } else {
            insideParentheses.components.push(component);
          }
        }
      }
    } else if (component.type === "value") {
      lastComponent = "value: " + component.value;
      if (insideParentheses !== null) {
        insideParentheses.components.push(component);
      } else {
        currentOperand = component.value;
      }
    }
  });

  if (formula.components.length === 1 && currentOperand) {
    result = currentOperand;
  }

  if (currentOperand !== null && currentOperator !== null) {
    const operator = currentOperator as FormulaOperatorType;
    result = BinaryOperatorUtils.binaryOperators[operator](result, currentOperand);
  } else if (result === null) {
    if (!lastComponent) {
      throw new Error("Invalid formula");
    } else {
      throw new Error(`Invalid formula component ${lastComponent}`);
    }
  }

  switch (resultAs) {
    case "number":
      return result !== null ? Number(result) : null;
    case "boolean":
      return result !== null ? Boolean(result) : null;
    case "date":
      return !result === null || result instanceof Date === false ? null : result;
    case "string":
      return result !== null ? String(result) : null;
    default:
      throw new Error("Invalid resultAs value in formula");
  }
}

export default {
  calculateFormula,
};
