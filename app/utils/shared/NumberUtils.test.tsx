import { describe, it, expect } from "vitest";
import NumberUtils, { NumberFormats } from "./NumberUtils";

describe("Number Formatting", () => {
  it("should format integer values correctly", () => {
    const input = 1234567890;
    const expectedOutput = "1,234,567,890";
    const output = NumberUtils.intFormat(input);
    expect(output).toStrictEqual(expectedOutput);
  });

  it("should format decimal values correctly", () => {
    const input = 1234567.89;
    const expectedOutput = "1,234,567.89";
    const output = NumberUtils.decimalFormat(input);
    expect(output).toStrictEqual(expectedOutput);
  });

  it("should format numbers as currency correctly", () => {
    const input = 1234567.89;
    const expectedOutput = "1,234,568";
    const output = NumberUtils.numberFormat(input);
    expect(output).toStrictEqual(expectedOutput);
  });

  it("should pad numbers correctly", () => {
    const input = 42;
    const expectedOutput = "00042";
    const output = NumberUtils.pad(input, 5);
    expect(output).toStrictEqual(expectedOutput);
  });

  it("should have the correct default currency symbol", () => {
    const expectedOutput = "$";
    expect(NumberUtils.defaultCurrencySymbol).toStrictEqual(expectedOutput);
  });

  it("should have the correct number formats", () => {
    const expectedOutput = [
      { name: "Integer", value: "integer" },
      { name: "Decimal", value: "decimal" },
      { name: "Currency", value: "currency" },
      { name: "Percent", value: "percentage" },
      { name: "Rating", value: "rating" },
    ];
    expect(NumberFormats).toStrictEqual(expectedOutput);
  });
});
