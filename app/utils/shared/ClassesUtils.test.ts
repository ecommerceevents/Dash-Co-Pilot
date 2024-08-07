import { describe, it, expect } from "vitest";
import clsx from "./ClassesUtils";

describe("clsx", () => {
  it("should concatenate all truthy classes with a space", () => {
    const classes = ["class-1", "class-2", "", null, undefined, false, "class-3"];
    const result = clsx(...classes);
    expect(result).toEqual("class-1 class-2 class-3");
  });

  it("should return an empty string if all classes are falsy", () => {
    const classes = ["", null, undefined, false];
    const result = clsx(...classes);
    expect(result).toEqual("");
  });

  it("should return an empty string if no classes are provided", () => {
    const classes: any[] = [];
    const result = clsx(...classes);
    expect(result).toEqual("");
  });
});
