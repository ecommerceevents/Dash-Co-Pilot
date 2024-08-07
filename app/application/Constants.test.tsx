import { describe, it, expect } from "vitest";
import Constants from "./Constants";

describe("Constants", () => {
  it("Constants exports the correct values", () => {
    expect(Constants.DEFAULT_PAGE_SIZE).toEqual(10);
    expect(Constants.DEFAULT_ROW_VISIBILITY).toEqual("tenant");
    expect(Constants.MAX_PAGE_SIZE).toEqual(100);
    expect(Constants.MAX_EXPORT_PAGE_SIZE).toEqual(100000);
    expect(Constants.PAGE_SIZE_OPTIONS).toEqual([5, 10, 25, 50, 100]);
  });
});
