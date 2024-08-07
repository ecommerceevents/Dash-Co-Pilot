import {describe, test, expect} from 'vitest'
import { getStatChangePercentage, getStatChangeType } from "./DashboardUtils";
import { StatChange } from "~/application/dtos/stats/StatChange";

describe("getStatChangePercentage", () => {
  test("returns 100 when total is less than or equal to zero", () => {
    expect(getStatChangePercentage(5, 0)).toBe(100);
    expect(getStatChangePercentage(5, -1)).toBe(100);
  });

  test("returns the correct percentage when total is greater than zero", () => {
    expect(getStatChangePercentage(5, 10)).toBe(50);
    expect(getStatChangePercentage(1, 4)).toBe(25);
    expect(getStatChangePercentage(0, 5)).toBe(0);
  });
});

describe("getStatChangeType", () => {
  test("returns StatChange.Equal when change is zero", () => {
    expect(getStatChangeType(0, 5)).toBe(StatChange.Equal);
  });

  test("returns StatChange.Increase when change is positive", () => {
    expect(getStatChangeType(5, 10)).toBe(StatChange.Increase);
    expect(getStatChangeType(2, 1)).toBe(StatChange.Increase);
    expect(getStatChangeType(-2, -1)).toBe(StatChange.Increase);
  });

  test("returns StatChange.Decrease when change is negative", () => {
    expect(getStatChangeType(-5, 10)).toBe(StatChange.Decrease);    
    expect(getStatChangeType(-2, 2)).toBe(StatChange.Decrease);
  });
});