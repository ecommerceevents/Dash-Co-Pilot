import { JsonPropertiesValuesDto } from "~/modules/jsonProperties/dtos/JsonPropertiesValuesDto";

export type PortalDto = {
  id: string;
  tenantId: string | null;
  url: string;
  subdomain: string;
  domain: string | null;
  title: string;
  isPublished: boolean;
  stripeAccountId: string | null;
  metadata: JsonPropertiesValuesDto;
  theme: {
    color: string;
    scheme: "light" | "dark";
  };
  seo: {
    title: string | null;
    description?: string | null;
    image?: string | null;
  };
  auth: {
    requireEmailVerification: boolean;
    requireOrganization: boolean;
    requireName: boolean;
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
  subscription: {
    required: boolean;
    allowSubscribeBeforeSignUp: boolean;
    allowSignUpBeforeSubscribe: boolean;
  };
  analytics: {
    simpleAnalytics: boolean;
    plausibleAnalytics: boolean;
    googleAnalyticsTrackingId?: string | null;
  };
  branding: {
    logo: string | null;
    logoDarkMode: string | null;
    icon: string | null;
    iconDarkMode: string | null;
    favicon: string | null;
  };
  cookies?: {
    enabled: boolean;
  };
  affiliates?: {
    rewardful?: { apiKey: string; url: string };
  };
};
