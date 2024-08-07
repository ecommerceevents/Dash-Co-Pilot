import platform from "platform";
import { CookieCategory } from "~/application/cookies/CookieCategory";
import { UserSession } from "../session.server";
import CookieHelper from "./CookieHelper";
import { AppConfiguration } from "../db/appConfiguration.db.server";
import { AnalyticsInfoDto } from "~/application/dtos/marketing/AnalyticsInfoDto";

declare global {
  interface Window {
    gtag?: (option: string, gaTrackingId: string, options: Record<string, unknown>) => void;
  }
}

type AnalyticsProps = {
  url: string;
  rootData: { userSession: UserSession; appConfiguration: AppConfiguration; analytics?: AnalyticsInfoDto };
  route?: string;
};

export async function addPageView({ url, rootData, route }: AnalyticsProps) {
  const gaTrackingId = rootData.appConfiguration?.analytics.googleAnalyticsTrackingId;
  if (CookieHelper.hasConsent(rootData.userSession, CookieCategory.ADVERTISEMENT) && gaTrackingId) {
    // console.log("[PAGE VIEW] Google Analytics");
    if (!window.gtag) {
      // eslint-disable-next-line no-console
      console.warn("window.gtag is not defined. This could mean your google analytics script has not loaded on the page yet.");
    } else {
      window.gtag("config", gaTrackingId, {
        page_path: url,
      });
    }
  }
  if (rootData.analytics) {
    // console.log("[PAGE VIEW]", JSON.stringify({ url, analytics: rootData.analytics }));
    try {
      await fetch("/api/analytics/page-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          route,
          analytics: {
            ...rootData.analytics,
            userAgent: getUserAgentDetails(),
          },
        }),
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[PAGE VIEW]", e.message);
    }
  }
}

type EventProps = AnalyticsProps & {
  url?: string;
  action: string;
  category: string;
  label: string;
  value: string;
};
export async function addEvent({ url, route, action, category, label, value, rootData }: EventProps) {
  const gaTrackingId = rootData.appConfiguration?.analytics.googleAnalyticsTrackingId;
  if (CookieHelper.hasConsent(rootData.userSession, CookieCategory.ADVERTISEMENT) && gaTrackingId) {
    // console.log("[EVENT] Google Analytics");
    if (!window.gtag) {
      // eslint-disable-next-line no-console
      console.warn("window.gtag is not defined. This could mean your google analytics script has not loaded on the page yet.");
    } else {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  if (rootData.analytics) {
    // console.log("[EVENT]", JSON.stringify({ action, category, label, value, url, analytics: rootData.analytics }));
    try {
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          category,
          label,
          value,
          url,
          route,
          analytics: {
            ...rootData.analytics,
            userAgent: getUserAgentDetails(),
          },
        }),
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[PAGE VIEW]", e.message);
    }
  }
}

function getUserAgentDetails(userAgent?: string) {
  const deviceType = () => {
    if (!userAgent) {
      return undefined;
    }
    const ua = userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  };
  return {
    type: deviceType(),
    os: {
      family: platform.os?.family,
      version: platform.os?.version,
    },
    browser: {
      name: platform.name,
      version: platform.version,
    },
  };
}

// export async function createUniqueVisitorHash(domain: string, ipAddress: string, userAgent: string) {
//   const hash = sha256(domain + ipAddress + userAgent);
//   console.log({ hash });
//   return hash;
// }

export default {
  addPageView,
  addEvent,
  getUserAgentDetails,
};
