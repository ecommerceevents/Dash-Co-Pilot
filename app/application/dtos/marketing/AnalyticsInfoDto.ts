export interface AnalyticsInfoDto {
  ip?: string;
  userAgent?: {
    type: string | undefined;
    os: {
      family: string | undefined;
      version: string | undefined;
    };
    browser: {
      name: string | undefined;
      version: string | undefined;
    };
  };
  referrer?: {
    via?: string;
    http?: string;
    source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  region?: {
    country?: string;
    city?: string;
  };
  userId: string | null;
  portalId?: string | null;
  portalUserId?: string | null;
  userAnalyticsId?: string;
}
