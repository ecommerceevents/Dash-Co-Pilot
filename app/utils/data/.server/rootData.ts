import { json } from "@remix-run/node";
import { Params } from "@remix-run/react";
import { CookieCategory } from "~/application/cookies/CookieCategory";
import { ImpersonatingSessionDto } from "~/application/dtos/session/ImpersonatingSessionDto";
import { remixI18Next, i18nCookie, getTranslations } from "~/locale/i18next.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { getAnalyticsSession, generateAnalyticsUserId, commitAnalyticsSession, destroyAnalyticsSession } from "~/utils/analyticsCookie.server";
import { AppConfiguration, getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import CookieHelper from "~/utils/helpers/CookieHelper";
import { promiseHash } from "~/utils/promises/promiseHash";
import { getUserInfo, getUserSession, generateCSRFToken, createUserSession, commitSession } from "~/utils/session.server";
import { getBaseURL, getDomainName } from "~/utils/url.server";
import { AppRootData } from "../useRootData";
import { getUser } from "~/utils/db/users.db.server";
import { AnalyticsInfoDto } from "~/application/dtos/marketing/AnalyticsInfoDto";
import AnalyticsService from "~/utils/helpers/.server/AnalyticsService";
import FeatureFlagsService from "~/modules/featureFlags/services/FeatureFlagsService";
import { cachified } from "~/utils/cache.server";
import Constants from "~/application/Constants";
import { getTenant } from "~/utils/db/tenants.db.server";

export async function loadRootData({ request, params }: { request: Request; params: Params }) {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "root");
  const { t } = await getTranslations(request);
  const { userInfo, session, analyticsSession } = await time(
    promiseHash({
      userInfo: getUserInfo(request),
      session: getUserSession(request),
      analyticsSession: getAnalyticsSession(request),
    }),
    "loadRootData.session"
  );
  const user = userInfo.userId ? await getUser(userInfo.userId) : null;
  const currentTenant = params.tenant ? await getTenant(params.tenant) : user?.defaultTenantId ? await getTenant(user.defaultTenantId) : null;

  const csrf = generateCSRFToken();
  session.set("csrf", csrf);

  let analytics: AnalyticsInfoDto | undefined = undefined;
  const appConfiguration = await time(getAppConfiguration({ request }), "getAppConfiguration");
  if (appConfiguration.analytics.enabled) {
    try {
      analytics = await AnalyticsService.getFromRequest({ appConfiguration, request, userId: userInfo.userId ?? null });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
    }
  }

  const headers = new Headers();
  let userAnalyticsId = analyticsSession.get("userAnalyticsId");
  headers.append("Set-Cookie", await commitSession(session));
  // if (CookieHelper.hasConsent(userInfo, CookieCategory.ANALYTICS)) {
  if (!userAnalyticsId) {
    userAnalyticsId = generateAnalyticsUserId();
    analyticsSession.set("userAnalyticsId", userAnalyticsId);
  }
  headers.append("Set-Cookie", await commitAnalyticsSession(analyticsSession));
  // } else {
  //   headers.append("Set-Cookie", await destroyAnalyticsSession(analyticsSession));
  // }

  let impersonatingSession: ImpersonatingSessionDto | null = null;
  if (userInfo.impersonatingFromUserId && userInfo.userId?.length > 0) {
    const fromUser = await getUser(userInfo.impersonatingFromUserId);
    const toUser = await getUser(userInfo.userId);
    if (fromUser && toUser) {
      impersonatingSession = { fromUser, toUser };
    }
  }

  const locale = await remixI18Next.getLocale(request);
  const data: AppRootData = {
    metatags: [{ title: `${process.env.APP_NAME}` }],
    user,
    currentTenant,
    locale,
    theme: userInfo.theme || appConfiguration.app.theme,
    serverUrl: getBaseURL(request),
    domainName: getDomainName(request),
    userSession: userInfo,
    authenticated: userInfo.userId?.length > 0,
    debug: process.env.NODE_ENV === "development",
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    chatWebsiteId: process.env.CRISP_CHAT_WEBSITE_ID?.toString(),
    appConfiguration,
    csrf,
    analytics,
    featureFlags: appConfiguration.featureFlags.enabled ? await FeatureFlagsService.getCurrentFeatureFlags({ request, params, userAnalyticsId }) : [],
    impersonatingSession,
    version: await getVersion(appConfiguration),
  };

  const updateLightOrDarkMode = appConfiguration.app.supportedThemes !== "light-and-dark" && userInfo.lightOrDarkMode !== appConfiguration.app.supportedThemes;
  const updateMetrics = userInfo.userId?.length > 0 && appConfiguration.metrics.enabled !== userInfo.metrics?.enabled;
  const needsToUpdateSession = updateLightOrDarkMode || updateMetrics;
  if (needsToUpdateSession) {
    return createUserSession(
      {
        ...userInfo,
        lightOrDarkMode: appConfiguration.app.supportedThemes,
        metrics: appConfiguration.metrics,
      },
      new URL(request.url).pathname + new URL(request.url).search
    );
  }

  headers.append("Server-Timing", getServerTimingHeader()["Server-Timing"]);
  headers.append("Set-Cookie", await i18nCookie.serialize(locale));
  return json(data, {
    headers,
  });
}
const getVersion = async ({ app }: AppConfiguration) => {
  const version: {
    current: string;
    latest: string;
    hasUpdate: boolean;
    versions: { description: string; latest: boolean; current: boolean; version: string; date: Date }[];
  } = {
    current: Constants.VERSION,
    latest: "",
    hasUpdate: false,
    versions: [],
  };
  try {
    if (process.env.NODE_ENV === "development") {
      return version;
    }
    const data: {
      current: { version: string; date: string };
      versions: { description: string; version: string; date: string }[];
    } = await cachified({
      key: "sr-version",
      ttl: 60 * 60 * 24,
      getFreshValue: async () => {
        const response = await fetch(`https://saasrock.com/api/version?app=${app.name}&url=${app.url}&domain=${app.domain}&version=${Constants.VERSION}`).catch(
          (e) => {
            throw Error(e);
          }
        );
        return await response.json();
      },
    });
    version.latest = data.current.version;
    version.hasUpdate = version.current < version.latest;
    version.versions = data.versions.map((f) => ({
      description: f.description || `<b>${f.version}</b> - ${new Date(f.date).toLocaleDateString()}`,
      latest: f.version === version.latest,
      current: f.version === version.current,
      version: f.version,
      date: new Date(f.date),
    }));
    return version;
  } catch (error: any) {
    // console.error("[getVersion] Error", error.message);
    return version;
  }
};
