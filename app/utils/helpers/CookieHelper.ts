import { Location } from "@remix-run/react";
import { allCookieCategories } from "~/application/cookies/ApplicationCookies";
import { CookieCategory } from "~/application/cookies/CookieCategory";
import { UserSession } from "../session.server";

function hasConsent(userSession: UserSession, category: CookieCategory) {
  return category === CookieCategory.REQUIRED || userSession?.cookies?.find((f) => f.category === CookieCategory[category])?.allowed;
}
function requiresCookieConsent(userSession: UserSession, searchParams: URLSearchParams) {
  if (!userSession.cookies || userSession.cookies.length === 0 || searchParams.get("cookies")) {
    return true;
  }

  const requiredCookieCategoryConsent = allCookieCategories.map((cookieCategory) => {
    if (userSession.cookies.find((f) => f.category === CookieCategory[cookieCategory]) === undefined) {
      return cookieCategory;
    }
    return null;
  });
  if (requiredCookieCategoryConsent.filter((f) => f).length > 0) {
    return true;
  }

  return false;
}

function getUpdateCookieConsentForm({
  location,
  selectedCookies,
  searchParams,
}: {
  location: Location;
  selectedCookies: CookieCategory[];
  searchParams: URLSearchParams;
}) {
  const form = new FormData();
  form.set("action", "setCookieConsent");
  form.set("redirect", location.pathname);
  form.set("ref", searchParams.get("ref")?.toString() ?? "");
  form.set("source", searchParams.get("source")?.toString() ?? "");
  form.set("utm_source", searchParams.get("utm_source")?.toString() ?? "");
  form.set("utm_medium", searchParams.get("utm_medium")?.toString() ?? "");
  form.set("utm_campaign", searchParams.get("utm_campaign")?.toString() ?? "");
  form.set("utm_content", searchParams.get("utm_content")?.toString() ?? "");
  form.set("utm_term", searchParams.get("utm_term")?.toString() ?? "");
  selectedCookies.forEach((cookie) => {
    form.append("cookies[]", CookieCategory[cookie]);
  });
  return form;
}

export default {
  hasConsent,
  requiresCookieConsent,
  getUpdateCookieConsentForm,
};
