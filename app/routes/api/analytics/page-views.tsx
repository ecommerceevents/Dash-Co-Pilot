import { AnalyticsUniqueVisitor, Prisma } from "@prisma/client";
import { ActionFunction, json } from "@remix-run/node";
import { AnalyticsInfoDto } from "~/application/dtos/marketing/AnalyticsInfoDto";
import { getAnalyticsInfo } from "~/utils/analyticsCookie.server";
import { clearCacheKey } from "~/utils/cache.server";
import { db } from "~/utils/db.server";
import AnalyticsService from "~/utils/helpers/.server/AnalyticsService";

export function loader() {
  return json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, referer-path",
        "Access-Control-Allow-Methods": "GET",
      },
    }
  );
}

// const ignoreUrl = ["/admin/analytics"];
export const action: ActionFunction = async ({ request, params }) => {
  try {
    if (request.method === "OPTIONS") {
      return json(
        {},
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, referer-path",
          },
        }
      );
    }
    // const userInfo = await getUserInfo(request);
    // if (!CookieHelper.hasConsent(userInfo, CookieCategory.ANALYTICS)) {
    //   return json({ error: "User has not consented to analytics" }, 400);
    // }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
    const analyticsSessionInfo = await getAnalyticsInfo(request);

    const jsonBody = (await request.json()) as {
      url: string;
      route: string;
      analytics: AnalyticsInfoDto;
    };

    let userAnalyticsId = analyticsSessionInfo?.userAnalyticsId ?? jsonBody.analytics.userAnalyticsId;
    if (!userAnalyticsId) {
      return json({ error: "Invalid Analytics Cookie" }, { status: 401 });
    }

    const settings = await db.analyticsSettings.findFirst({});
    const ignoredPages = settings?.ignorePages?.split(",") ?? [];

    if (ignoredPages.find((f) => f !== "" && jsonBody.url.includes(f))) {
      return json({ error: "Ingored URL" }, { status: 204 });
    }
    const uniqueVisitor = await AnalyticsService.getOrCreateUniqueVisitor({
      cookie: userAnalyticsId,
      fromUrl: jsonBody.url,
      fromRoute: jsonBody.route,
      analytics: jsonBody.analytics,
    });
    if (!uniqueVisitor) {
      throw new Error("Unique visitor not found");
    }
    await updateUniqueVisitorSource(uniqueVisitor, jsonBody.analytics);
    await db.analyticsPageView.create({
      data: {
        uniqueVisitorId: uniqueVisitor.id,
        url: jsonBody.url,
        route: jsonBody.route,
        portalId: jsonBody.analytics.portalId || null,
        portalUserId: jsonBody.analytics.portalUserId || null,
      },
    });

    return json({ success: true }, { status: 201 });
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};

async function updateUniqueVisitorSource(uniqueVisitor: AnalyticsUniqueVisitor, analytics: AnalyticsInfoDto) {
  let where = { id: uniqueVisitor.id };
  const data: Prisma.AnalyticsUniqueVisitorUncheckedUpdateInput = {};
  if (analytics.referrer?.source && uniqueVisitor.source !== analytics.referrer?.source) {
    data.source = analytics.referrer?.source;
  }
  if (analytics.referrer?.utm_medium && uniqueVisitor.medium !== analytics.referrer?.utm_medium) {
    data.medium = analytics.referrer?.utm_medium;
  }
  if (analytics.referrer?.utm_campaign && uniqueVisitor.campaign !== analytics.referrer?.utm_campaign) {
    data.campaign = analytics.referrer?.utm_campaign;
  }
  if (analytics.referrer?.utm_content && uniqueVisitor.content !== analytics.referrer?.utm_content) {
    data.content = analytics.referrer?.utm_content;
  }
  if (analytics.referrer?.utm_term && uniqueVisitor.term !== analytics.referrer?.utm_term) {
    data.term = analytics.referrer?.utm_term;
  }
  if (analytics.region?.country && uniqueVisitor.country !== analytics.region?.country) {
    data.country = analytics.region?.country;
  }
  if (analytics.region?.city && uniqueVisitor.city !== analytics.region?.city) {
    data.city = analytics.region?.city;
  }
  if (analytics.userId && uniqueVisitor.userId !== analytics.userId) {
    data.userId = analytics.userId;
  }
  if (analytics.portalUserId && uniqueVisitor.portalUserId !== analytics.portalUserId) {
    data.portalUserId = analytics.portalUserId;
  }
  if (Object.keys(data).length > 0) {
    await db.analyticsUniqueVisitor.update({ where, data }).then((item) => {
      clearCacheKey(`analytics:uniqueVisitor:${item.cookie}`);
      return item;
    });
  }
}
