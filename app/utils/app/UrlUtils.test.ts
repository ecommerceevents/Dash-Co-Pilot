import { describe, test, expect } from "vitest";
import UrlUtils from "./UrlUtils";

describe("UrlUtils", () => {
  test("stripTrailingSlash should remove the trailing slash from a string", () => {
    const input = "foo/bar/";
    const expectedOutput = "foo/bar";
    const actualOutput = UrlUtils.stripTrailingSlash(input);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("currentTenantUrl should return a URL with the tenant parameter", () => {
    const params = { tenant: "foo" };
    const expectedOutput = "/app/foo/";
    const actualOutput = UrlUtils.currentTenantUrl(params);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("currentEntityUrl should return a URL with the tenant and entity parameters", () => {
    const params = { tenant: "foo", entity: "bar" };
    const expectedOutput = "/app/foo/bar";
    const actualOutput = UrlUtils.currentEntityUrl(params);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("replaceVariables should replace the :tenant variable in a URL with the tenant parameter", () => {
    const params = { tenant: "foo" };
    const input = "/api/:tenant/foo";
    const expectedOutput = "/api/foo/foo";
    const actualOutput = UrlUtils.replaceVariables(params, input);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("slugify should convert a string into a URL-friendly slug", () => {
    const input = "Hello, world!";
    const expectedOutput = "hello-world";
    const actualOutput = UrlUtils.slugify(input);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("getParentRoute should return the parent route of a given URL", () => {
    const input = "/foo/bar/baz";
    const expectedOutput = "/foo/bar";
    const actualOutput = UrlUtils.getParentRoute(input);
    expect(actualOutput).toEqual(expectedOutput);
  });
});
