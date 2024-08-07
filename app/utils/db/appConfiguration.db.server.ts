import { db } from "../db.server";
import { getBaseURL, getDomainName } from "../url.server";
import { cachified, clearCacheKey } from "../cache.server";
import { Prisma } from "@prisma/client";
import { defaultTheme } from "../theme/defaultThemes";
import { PortalConfiguration, getAppPortalConfiguration } from "./appPortalConfiguration.db.server";
import { getTranslations } from "~/locale/i18next.server";

export type AppConfiguration = {
  app: {
    name: string;
    url: string;
    domain: string;
    theme: string;
    supportedThemes: "light" | "dark" | "light-and-dark";
    features: {
      tenantHome: "/app/:tenant/" | "/";
      tenantTypes: boolean;
      tenantApiKeys?: boolean;
      tenantEntityCustomization?: boolean;
      tenantBlogs: boolean;
      tenantWorkflows: boolean;
      tenantEmailMarketing: boolean;
      linkedAccounts: boolean; // deprecated, use tenantTypes
      tenantFeedback: boolean;
    };
  };
  auth: {
    requireEmailVerification: boolean;
    requireOrganization: boolean;
    requireName: boolean;
    slug: { require: boolean; type: "tenant" | "username" } | null;
    recaptcha: {
      enabled: boolean;
      siteKey: string;
    };
    authMethods: {
      emailPassword: {
        enabled: boolean;
      };
      github: {
        enabled: boolean;
        authorizationURL: string;
      };
      google: {
        enabled: boolean;
      };
    };
  };
  analytics: {
    enabled: boolean;
    simpleAnalytics: boolean;
    plausibleAnalytics: boolean;
    googleAnalyticsTrackingId?: string;
    ipLookup?: boolean;
  };
  subscription: {
    required: boolean;
    allowSubscribeBeforeSignUp: boolean;
    allowSignUpBeforeSubscribe: boolean;
  };
  cookies: {
    enabled: boolean;
  };
  notifications: {
    enabled: boolean;
    novuAppId?: string;
  };
  onboarding: {
    enabled: boolean;
  };
  featureFlags: {
    enabled: boolean; // load all flags
  };
  metrics: {
    enabled: boolean;
    logToConsole: boolean;
    saveToDatabase: boolean;
    ignoreUrls: string[];
  };
  branding: {
    logo?: string;
    logoDarkMode?: string;
    icon?: string;
    iconDarkMode?: string;
    favicon?: string;
  };
  affiliates?: {
    provider: { rewardfulApiKey: string };
    signUpLink: string;
    percentage: number;
    plans: { title: string; price: number }[];
  };
  reviews?: {
    trustpilot?: { href: string; templateId: string; businessUnitId: string };
  };
  launches?: {
    producthunt?: { title: string; url: string; postId: string };
  };
  portals: PortalConfiguration;
  scripts: { head: string | null; body: string | null };
};

export async function getAppConfiguration({ request }: { request: Request }): Promise<AppConfiguration> {
  const { t } = await getTranslations(request);
  const conf: AppConfiguration = {
    app: {
      name: process.env.APP_NAME?.toString() ?? "",
      url: getBaseURL(request),
      domain: getDomainName(request),
      theme: defaultTheme,
      supportedThemes: "light-and-dark",
      features: {
        tenantHome: "/app/:tenant/",
        tenantApiKeys: true,
        tenantEntityCustomization: false,
        tenantTypes: false,
        tenantBlogs: false,
        tenantWorkflows: false,
        tenantEmailMarketing: false,
        linkedAccounts: false,
        tenantFeedback: true,
      },
    },
    auth: {
      requireEmailVerification: false,
      requireOrganization: false,
      requireName: false,
      slug: { require: false, type: "username" },
      recaptcha: {
        enabled: false,
        siteKey: process.env.AUTH_RECAPTCHA_SITE_KEY ?? "",
      },
      authMethods: {
        emailPassword: {
          enabled: true,
        },
        github: {
          enabled: false,
          authorizationURL: (() => {
            const url = new URL("https://github.com/login/oauth/authorize");
            url.searchParams.append("client_id", process?.env.GITHUB_OAUTH_CLIENT_ID ?? "");
            url.searchParams.append("redirect_uri", getBaseURL(request) + "/oauth/github/callback");
            url.searchParams.append("scope", ["read:user", "user:email"].join(","));
            return url.toString();
          })(),
        },
        google: {
          enabled: false,
        },
      },
    },
    analytics: {
      enabled: true,
      googleAnalyticsTrackingId: process.env.ANALYTICS_GA_TRACKING_ID,
      simpleAnalytics: true,
      plausibleAnalytics: false,
      ipLookup: true,
    },
    subscription: {
      required: false,
      allowSubscribeBeforeSignUp: true,
      allowSignUpBeforeSubscribe: true,
    },
    cookies: {
      enabled: false,
    },
    notifications: {
      enabled: !!process.env.NOTIFICATIONS_NOVU_APP_ID && !!process.env.NOTIFICATIONS_NOVU_API_KEY,
      novuAppId: process.env.NOTIFICATIONS_NOVU_APP_ID,
    },
    onboarding: {
      enabled: true,
    },
    featureFlags: {
      enabled: true,
    },
    metrics: {
      enabled: false,
      logToConsole: false,
      saveToDatabase: false,
      ignoreUrls: ["/build", "/admin/metrics"],
    },
    branding: {
      logo: undefined,
      logoDarkMode: undefined,
      icon: undefined,
      iconDarkMode: undefined,
      favicon: undefined,
    },
    affiliates: undefined,
    // affiliates: {
    //   provider: { rewardfulApiKey: "abc123" },
    //   signUpLink: "https://myapp.getrewardful.com/",
    //   percentage: 30,
    //   plans: [
    //     { title: "Starter", price: 100 },
    //     { title: "Pro", price: 200 },
    //     { title: "Enterprise", price: 300 },
    //   ],
    // },
    launches: undefined,
    portals: getAppPortalConfiguration({ t }),
    scripts: { head: null, body: null },
  };

  const appConfiguration = await cachified({
    key: `appConfiguration`,
    ttl: 1000 * 60 * 60 * 24, // 1 day
    getFreshValue: async () => db.appConfiguration.findFirst(),
  });
  if (!appConfiguration) {
    return conf;
  }
  conf.app.name = appConfiguration?.name ?? "";
  // conf.app.url = appConfiguration?.url ?? "";
  conf.app.theme = appConfiguration?.theme ?? defaultTheme;

  conf.auth.requireEmailVerification = appConfiguration?.authRequireEmailVerification;
  conf.auth.requireOrganization = appConfiguration?.authRequireOrganization;
  conf.auth.requireName = appConfiguration?.authRequireName;
  conf.auth.recaptcha.enabled = false;
  conf.auth.recaptcha.siteKey = appConfiguration.authRecaptchaSiteKey ?? "";
  if (appConfiguration.authRecaptchaSiteKey) {
    conf.auth.recaptcha.enabled = true;
  }

  conf.analytics.enabled = appConfiguration?.analyticsEnabled;
  conf.analytics.simpleAnalytics = appConfiguration?.analyticsSimpleAnalytics;
  conf.analytics.plausibleAnalytics = appConfiguration?.analyticsPlausibleAnalytics;
  conf.analytics.googleAnalyticsTrackingId = appConfiguration?.analyticsGoogleAnalyticsTrackingId ?? undefined;

  conf.subscription.required = appConfiguration?.subscriptionRequired;
  conf.subscription.allowSubscribeBeforeSignUp = appConfiguration?.subscriptionAllowSubscribeBeforeSignUp;
  conf.subscription.allowSignUpBeforeSubscribe = appConfiguration?.subscriptionAllowSignUpBeforeSubscribe;

  conf.cookies.enabled = appConfiguration?.cookiesEnabled;

  conf.metrics.enabled = appConfiguration?.metricsEnabled;
  conf.metrics.logToConsole = appConfiguration?.metricsLogToConsole;
  conf.metrics.saveToDatabase = appConfiguration?.metricsSaveToDatabase;
  conf.metrics.ignoreUrls = appConfiguration?.metricsIgnoreUrls?.split(",") ?? [];

  conf.branding.logo = appConfiguration?.brandingLogo ?? undefined;
  conf.branding.logoDarkMode = appConfiguration?.brandingLogoDarkMode ?? undefined;
  conf.branding.icon = appConfiguration?.brandingIcon ?? undefined;
  conf.branding.iconDarkMode = appConfiguration?.brandingIconDarkMode ?? undefined;
  conf.branding.favicon = appConfiguration?.brandingFavicon ?? undefined;

  conf.scripts = {
    head: appConfiguration?.headScripts || null,
    body: appConfiguration?.bodyScripts || null,
  };

  return conf;
}

export async function getOrCreateAppConfiguration({ request }: { request: Request }) {
  let settings = await db.appConfiguration.findFirst();
  if (!settings) {
    const conf = await getAppConfiguration({ request });
    settings = await db.appConfiguration
      .create({
        data: {
          name: conf.app.name,
          url: conf.app.url,
          authRequireEmailVerification: conf.auth.requireEmailVerification,
          authRequireOrganization: conf.auth.requireOrganization,
          authRequireName: conf.auth.requireName,
          authRecaptchaSiteKey: conf.auth.recaptcha.siteKey,
          analyticsEnabled: conf.analytics.enabled,
          analyticsSimpleAnalytics: conf.analytics.simpleAnalytics,
          analyticsPlausibleAnalytics: conf.analytics.plausibleAnalytics,
          analyticsGoogleAnalyticsTrackingId: conf.analytics.googleAnalyticsTrackingId,
          subscriptionRequired: conf.subscription.required,
          subscriptionAllowSubscribeBeforeSignUp: conf.subscription.allowSubscribeBeforeSignUp,
          subscriptionAllowSignUpBeforeSubscribe: conf.subscription.allowSignUpBeforeSubscribe,
          cookiesEnabled: conf.cookies.enabled,
          metricsEnabled: conf.metrics.enabled,
          metricsLogToConsole: conf.metrics.logToConsole,
          metricsSaveToDatabase: conf.metrics.saveToDatabase,
          metricsIgnoreUrls: conf.metrics.ignoreUrls.join(","),
          brandingLogo: conf.branding.logo,
          brandingLogoDarkMode: conf.branding.logoDarkMode,
          brandingIcon: conf.branding.icon,
          brandingIconDarkMode: conf.branding.iconDarkMode,
          brandingFavicon: conf.branding.favicon,
        },
      })
      .then((item) => {
        clearCacheKey(`appConfiguration`);
        return item;
      });
  }
  return settings;
}

export async function updateAppConfiguration(data: Prisma.AppConfigurationUpdateInput) {
  return await db.appConfiguration
    .updateMany({
      data,
    })
    .then((item) => {
      clearCacheKey(`appConfiguration`);
      return item;
    });
}

export async function deleteAppConfiguration() {
  return await db.appConfiguration.deleteMany({ where: {} }).then((item) => {
    clearCacheKey(`appConfiguration`);
    return item;
  });
}
