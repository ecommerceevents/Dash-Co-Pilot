import moment from "moment";
import { db } from "../../db.server";
import { adminGetAllUsersNamesInIds } from "../../db/users.db.server";
import DateUtils from "../../shared/DateUtils";
import PeriodHelper, { PeriodFilter } from "../PeriodHelper";
import { AnalyticsInfoDto } from "~/application/dtos/marketing/AnalyticsInfoDto";
import { getClientIPAddress } from "~/utils/server/IpUtils";
import AnalyticsHelper from "../AnalyticsHelper";
import { AppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { cachified, clearCacheKey } from "~/utils/cache.server";
import { IpAddressDto } from "~/modules/ipAddress/dtos/IpAddressDto";
import IpAddressServiceServer from "~/modules/ipAddress/services/IpAddressService.server";

async function getOrCreateUniqueVisitor({
  cookie,
  fromUrl,
  fromRoute,
  analytics,
}: {
  cookie: string;
  fromUrl?: string;
  fromRoute?: string;
  analytics: AnalyticsInfoDto;
}) {
  const visitor = await cachified({
    key: `analytics:uniqueVisitor:${cookie}`,
    ttl: 60 * 60,
    getFreshValue: async () => {
      return db.analyticsUniqueVisitor.findUnique({
        where: {
          cookie,
        },
      });
    },
  });
  if (visitor) {
    return visitor;
  }
  // console.log("Creating unique visitor", { referrer: analytics.referrer });
  return await db.analyticsUniqueVisitor
    .create({
      data: {
        cookie,
        httpReferrer: analytics.referrer?.http,
        via: analytics.referrer?.via,
        browser: analytics.userAgent?.browser.name,
        browserVersion: analytics.userAgent?.browser.version,
        os: analytics.userAgent?.os.family,
        osVersion: analytics.userAgent?.os.version,
        device: analytics.userAgent?.type,
        source: analytics.referrer?.source,
        medium: analytics.referrer?.utm_medium,
        campaign: analytics.referrer?.utm_campaign,
        content: analytics.referrer?.utm_content,
        term: analytics.referrer?.utm_term,
        country: analytics.region?.country,
        city: analytics.region?.city,
        fromUrl,
        fromRoute,
        userId: analytics.userId ?? null,
        portalId: analytics.portalId ?? null,
        portalUserId: analytics.portalUserId ?? null,
      },
    })
    .then((e) => {
      clearCacheKey(`analytics:uniqueVisitor:${cookie}`);
      return e;
    });
}

export type AnalyticsOverviewDto = {
  uniqueVisitors: number;
  pageViews: number;
  events: number;
  liveVisitors: number;
  top: {
    sources: { name: string | null; count: number }[];
    httpReferrers: { name: string | null; count: number }[];
    urls: { name: string | null; count: number }[];
    routes: { name: string | null; count: number }[];
    os: { name: string | null; count: number }[];
    devices: { name: string | null; count: number }[];
    countries: { name: string | null; count: number }[];
    via: { name: string | null; count: number }[];
    medium: { name: string | null; count: number }[];
    campaign: { name: string | null; count: number }[];
    user: { name: string | null; count: number }[];
  };
  charts?: {
    pageViewsAndUniqueVisitors: {
      date: string;
      "Page views": number; // "Page Views"
      "Unique visitors": number; // "Unique Visitors"
    }[];
  };
};
type AnalyticsChart = "visitors" | "pages" | "events";
async function getAnalyticsOverview({ withUsers, period, portalId }: { withUsers: boolean; period: PeriodFilter; portalId: string | null | undefined }) {
  const createdAt = PeriodHelper.getCreatedAt(period);
  if (period === "all-time") {
    const firstDate = await db.analyticsUniqueVisitor.findFirst({
      where: { portalId },
      orderBy: { createdAt: "asc" },
    });
    if (firstDate) {
      createdAt.gte = firstDate.createdAt;
    }
  }
  const uniqueVisitors = await db.analyticsUniqueVisitor.count({
    where: { portalId, createdAt },
  });
  const pageViews = await db.analyticsPageView.count({
    where: {
      portalId,
      createdAt,
    },
  });
  const events = await db.analyticsEvent.count({
    where: {
      portalId,
      createdAt,
    },
  });
  const liveVisitors = await db.analyticsPageView.groupBy({
    by: ["uniqueVisitorId"],
    where: {
      portalId,
      createdAt: {
        gte: new Date(Date.now() - 1 * 60000),
      },
    },
  });

  const topHttpReferrers = (
    await db.analyticsUniqueVisitor.groupBy({
      by: ["httpReferrer"],
      _count: true,
      where: { portalId, createdAt },
    })
  ).map((f) => {
    return { name: f.httpReferrer, count: f._count };
  });
  const topSources = (
    await db.analyticsUniqueVisitor.groupBy({
      by: ["source"],
      _count: true,
      where: { portalId, createdAt },
    })
  ).map((f) => {
    return { name: f.source, count: f._count };
  });
  let topUrls = (
    await db.analyticsPageView.groupBy({
      by: ["url"],
      _count: true,
      where: { portalId, createdAt },
    })
  )
    .map((f) => {
      return { name: f.url, count: f._count };
    })
    .sort((a, b) => b.count - a.count);

  if (!withUsers) {
    if (topUrls.length > 10) {
      topUrls = topUrls.slice(0, 10);
    }
  }
  const topRoutes = (
    await db.analyticsPageView.groupBy({
      by: ["route"],
      _count: true,
      where: { portalId, createdAt },
    })
  ).map((f) => {
    return { name: f.route, count: f._count };
  });
  const topOs = (await db.analyticsUniqueVisitor.groupBy({ by: ["os"], _count: true, where: { portalId, createdAt } })).map((f) => {
    return { name: f.os, count: f._count };
  });
  const topDevices = (await db.analyticsUniqueVisitor.groupBy({ by: ["device"], _count: true, where: { portalId, createdAt } })).map((f) => {
    return { name: f.device, count: f._count };
  });
  const topCountries = (await db.analyticsUniqueVisitor.groupBy({ by: ["country"], _count: true, where: { portalId, createdAt } })).map((f) => {
    return { name: f.country, count: f._count };
  });
  const topVia = (await db.analyticsUniqueVisitor.groupBy({ by: ["via"], _count: true, where: { portalId, createdAt } })).map((f) => {
    return { name: f.via, count: f._count };
  });
  const topMedium = (await db.analyticsUniqueVisitor.groupBy({ by: ["medium"], _count: true, where: { portalId, createdAt } })).map((f) => {
    return { name: f.medium, count: f._count };
  });
  const topCampaign = (await db.analyticsUniqueVisitor.groupBy({ by: ["campaign"], _count: true, where: { portalId, createdAt } })).map((f) => {
    return { name: f.campaign, count: f._count };
  });
  let topUserIds: {
    id: string;
    count: number;
  }[] = [];
  if (withUsers) {
    topUserIds = (await db.analyticsUniqueVisitor.groupBy({ by: ["userId"], _count: true, where: { portalId, createdAt } })).map((f) => {
      return { id: f.userId ?? "", count: f._count };
    });
  }
  const users = await adminGetAllUsersNamesInIds(topUserIds.map((f) => f.id));
  const topUsers = topUserIds.map((f) => {
    const user = users.find((u) => u.id === f.id);
    return { name: user?.email ?? "", count: f.count };
  });

  const charts = await getCharts({ period, portalId });

  const data: AnalyticsOverviewDto = {
    uniqueVisitors,
    pageViews,
    events,
    liveVisitors: liveVisitors.length,
    top: {
      httpReferrers: topHttpReferrers.sort((a, b) => b.count - a.count),
      sources: topSources.sort((a, b) => b.count - a.count),
      urls: topUrls,
      routes: topRoutes.sort((a, b) => b.count - a.count),
      os: topOs.sort((a, b) => b.count - a.count),
      devices: topDevices.sort((a, b) => b.count - a.count),
      countries: topCountries.sort((a, b) => b.count - a.count),
      via: topVia.sort((a, b) => b.count - a.count),
      medium: topMedium.sort((a, b) => b.count - a.count),
      campaign: topCampaign.sort((a, b) => b.count - a.count),
      user: topUsers.sort((a, b) => b.count - a.count),
    },
    charts,
  };
  return data;
}

async function getCharts({ period, portalId }: { period: PeriodFilter; portalId: string | null | undefined }) {
  const createdAt = PeriodHelper.getCreatedAt(period);
  if (period === "all-time") {
    const firstDate = await db.analyticsUniqueVisitor.findFirst({
      where: { portalId },
      orderBy: {
        createdAt: "asc",
      },
    });
    if (firstDate) {
      createdAt.gte = firstDate.createdAt;
    }
  }
  const pageViewsByDay = await db.analyticsPageView.groupBy({
    by: ["createdAt"],
    _count: true,
    where: { portalId, createdAt },
  });

  const uniqueVisitorsByDay = await db.analyticsUniqueVisitor.groupBy({
    by: ["createdAt"],
    _count: true,
    where: { portalId, createdAt },
  });

  const toDateString = (date: Date) => {
    if (period === "last-24-hours") {
      return moment(date).format("hA");
    } else if (period === "last-hour" || period === "last-10-minutes") {
      return moment(date).format("h:mm A");
    }
    return DateUtils.dateMonthDay(date);
  };

  // Aggregate counts by date
  const aggregateCounts = (data: { createdAt: Date; _count: number }[]) => {
    const countMap = new Map();
    data.forEach((item) => {
      const dateKey = toDateString(item.createdAt);
      countMap.set(dateKey, (countMap.get(dateKey) || 0) + item._count);
    });
    return countMap;
  };

  const pageViewsMap = aggregateCounts(pageViewsByDay);
  const uniqueVisitorsMap = aggregateCounts(uniqueVisitorsByDay);

  const charts: AnalyticsOverviewDto["charts"] = {
    pageViewsAndUniqueVisitors: [],
  };

  // from createdAt.gte to createdAt.lte (or today), each day
  const currentDate = new Date();
  let date = new Date(createdAt.gte ?? currentDate);

  let i = 0;
  if (period === "last-24-hours") {
    date = new Date();
    date.setHours(date.getHours() - 23);
    for (let i = 1; i <= 24; i++) {
      const dateKey = toDateString(date);
      charts.pageViewsAndUniqueVisitors.push({
        date: dateKey,
        "Page views": pageViewsMap.get(dateKey) ?? 0,
        "Unique visitors": uniqueVisitorsMap.get(dateKey) ?? 0,
      });
      date.setHours(date.getHours() + 1);
    }
    return charts;
  } else if (period === "last-hour") {
    date = new Date();
    date.setMinutes(date.getMinutes() - 59);
    for (let i = 1; i <= 60; i++) {
      const dateKey = toDateString(date);
      charts.pageViewsAndUniqueVisitors.push({
        date: dateKey,
        "Page views": pageViewsMap.get(dateKey) ?? 0,
        "Unique visitors": uniqueVisitorsMap.get(dateKey) ?? 0,
      });
      date.setMinutes(date.getMinutes() + 1);
    }
    return charts;
  } else if (period === "last-10-minutes") {
    date = new Date();
    date.setMinutes(date.getMinutes() - 9);
    for (let i = 1; i <= 10; i++) {
      const dateKey = toDateString(date);
      charts.pageViewsAndUniqueVisitors.push({
        date: dateKey,
        "Page views": pageViewsMap.get(dateKey) ?? 0,
        "Unique visitors": uniqueVisitorsMap.get(dateKey) ?? 0,
      });
      date.setMinutes(date.getMinutes() + 1);
    }
    return charts;
  } else {
    while (date <= (createdAt.lte ?? currentDate) && i < 1000) {
      const dateKey = toDateString(date);
      charts.pageViewsAndUniqueVisitors.push({
        date: dateKey,
        "Page views": pageViewsMap.get(dateKey) ?? 0,
        "Unique visitors": uniqueVisitorsMap.get(dateKey) ?? 0,
      });
      date.setDate(date.getDate() + 1);
      i++;
    }
  }

  return charts;
}

async function getPageViews(filters: {
  url?: {
    startsWith?: string;
    contains?: string;
  };
  route?: {
    startsWith?: string;
    contains?: string;
  };
}) {
  return await db.analyticsPageView.findMany({
    where: {
      OR: [
        { url: { startsWith: filters.url?.startsWith, contains: filters.url?.contains } },
        { route: { startsWith: filters.route?.startsWith, contains: filters.route?.contains } },
      ],
    },
  });
}

async function getFromRequest({ appConfiguration, request, userId }: { appConfiguration: AppConfiguration; request: Request; userId: string | null }) {
  const searchParams = new URL(request.url).searchParams;

  // console.log({ headers: request.headers });
  let ip = getClientIPAddress(request)?.toString() || "";
  if (process.env.NODE_ENV === "development") {
    ip = "134.201.250.155";
  }
  const userAgent = request.headers.get("user-agent") ?? navigator.userAgent;
  const httpReferrer = request.headers.get("referer")?.toString();
  const ref = searchParams.get("ref")?.toString();
  const via = searchParams.get("via")?.toString();
  const source = searchParams.get("source")?.toString();
  const utm_source = searchParams.get("utm_source")?.toString();
  const utm_medium = searchParams.get("utm_medium")?.toString();
  const utm_campaign = searchParams.get("utm_campaign")?.toString();
  const utm_content = searchParams.get("utm_content")?.toString();
  const utm_term = searchParams.get("utm_term")?.toString();
  let mergedSource = "";
  if (ref && ref?.length > 0) {
    mergedSource = ref;
  } else if (source && source?.length > 0) {
    mergedSource = source;
  } else if (utm_source && utm_source?.length > 0) {
    mergedSource = utm_source;
  }
  let ipAddress: IpAddressDto | null = null;
  if (ip && appConfiguration.analytics.ipLookup) {
    ipAddress = await IpAddressServiceServer.getOrCreateIpAddressLookup(ip);
  }

  const analytics: AnalyticsInfoDto = {
    ip,
    userAgent: AnalyticsHelper.getUserAgentDetails(userAgent),
    referrer: {
      http: httpReferrer,
      via,
      source: mergedSource,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    },
    userId: userId && userId.length > 0 ? userId : null,
    region: {
      country: ipAddress?.countryCode || undefined,
      city: ipAddress?.city || undefined,
    },
  };
  return analytics;
}

export default {
  getOrCreateUniqueVisitor,
  getAnalyticsOverview,
  getPageViews,
  getFromRequest,
};
