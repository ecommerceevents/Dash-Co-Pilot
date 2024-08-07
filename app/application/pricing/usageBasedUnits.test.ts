import { describe, it, expect } from "vitest";
import { UsageBasedUnitDto } from "../dtos/subscriptions/UsageBasedUnitDto";
import { usageBasedUnits, UNIT_API_CALL, UNIT_EMPLOYEE } from "./usageBasedUnits";

describe("usageBasedUnits", () => {
  it("contains the correct units", () => {
    const expectedUnits: UsageBasedUnitDto[] = [
      UNIT_API_CALL,
      UNIT_EMPLOYEE,
      // UNIT_CONTRACT
    ];

    expect(usageBasedUnits).toHaveLength(expectedUnits.length);

    usageBasedUnits.forEach((unit, index) => {
      expect(unit.name).toEqual(expectedUnits[index].name);
      expect(unit.title).toEqual(expectedUnits[index].title);
      expect(unit.titlePlural).toEqual(expectedUnits[index].titlePlural);
    });
  });
});
