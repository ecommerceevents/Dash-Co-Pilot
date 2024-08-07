import { FormulaComponentDto } from "../dtos/FormulaDto";
import FormulaHelpers from "../utils/FormulaHelpers";

export default function FormulaComponentBadge({ item }: { item: FormulaComponentDto }) {
  return (
    <div>
      {item.type === "variable" && <span className="text-sm text-gray-500">{item.value}</span>}
      {item.type === "operator" && <span className="text-sm font-bold text-gray-900">{FormulaHelpers.getOperatorSymbol(item.value)}</span>}
      {item.type === "parenthesis" && <span className="text-gray-600">{item.value === "OPEN" ? "(" : ")"}</span>}
      {item.type === "value" && <span className="text-sm font-bold text-blue-900">{item.value}</span>}
    </div>
  );
}
