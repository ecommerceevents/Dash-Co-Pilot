import {describe, it, expect} from 'vitest'
import { CookieCategory } from "./CookieCategory";
import { allApplicationCookies, allCookieCategories } from "./ApplicationCookies";

describe("CookieData", () => {
  describe("allApplicationCookies", () => {
    it("should contain at least one cookie", () => {
      expect(allApplicationCookies.length).toBeGreaterThan(0);
    });

    it("should have unique cookie names", () => {
      const cookieNames = allApplicationCookies.map((cookie) => cookie.name);
      const uniqueCookieNames = new Set(cookieNames);
      expect(uniqueCookieNames.size).toEqual(cookieNames.length);
    });
  });

  describe("allCookieCategories", () => {
    it("should contain all categories present in allApplicationCookies", () => {
      const expectedCategories = [
        CookieCategory.REQUIRED,
        CookieCategory.FUNCTIONAL,
        CookieCategory.ANALYTICS,
        CookieCategory.ADVERTISEMENT,
      ];
      expect(allCookieCategories).toEqual(expectedCategories);
    });
  });
});