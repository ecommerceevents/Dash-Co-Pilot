import { UsageBasedUnitDto } from "../dtos/subscriptions/UsageBasedUnitDto";

export const UNIT_API_CALL: UsageBasedUnitDto = {
  name: "api",
  title: "API call",
  titlePlural: "API calls",
};

export const UNIT_EMPLOYEE: UsageBasedUnitDto = {
  name: "employee",
  title: "models.employee.object",
  titlePlural: "models.employee.plural",
};

// export const UNIT_CONTRACT: UsageBasedUnitDto = {
//   name: "contract",
//   title: "models.contract.object",
//   titlePlural: "models.contract.plural",
// };

export const usageBasedUnits = [
  UNIT_API_CALL,
  UNIT_EMPLOYEE,
  // UNIT_CONTRACT
];
