import { Params } from "@remix-run/router";
import { db } from "~/utils/db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";

export type TimeFunction = <T>(fn: Promise<T> | (() => T | Promise<T>), name: string) => Promise<T>;

export const timeFake: TimeFunction = async <T>(fn: Promise<T> | (() => T | Promise<T>), functionName = "_unidentifiedFunction_") => {
  if (typeof fn === "function") {
    return fn();
  }
  return fn;
};

export type MetricsArgs = {
  time: TimeFunction;
  getServerTimingHeader: () => { "Server-Timing": string };
};
export const createMetrics = async (
  { request, params, enabled = true }: { request: Request; params: Params; enabled?: boolean },
  route: string
): Promise<MetricsArgs> => {
  const { metrics } = await getUserInfo(request);
  const timings: { route: string; functionName: string; duration: number }[] = [];
  const env = process.env.NODE_ENV;
  const type = request.method === "GET" ? "loader" : "action";
  let userId: string | null = null;
  let tenantId: string | null = null;
  const pathname = new URL(request.url).pathname;
  const url = pathname.toString();

  const metricsEnabled = metrics?.enabled && enabled && !metrics.ignoreUrls.find((f) => url.startsWith(f));

  if (metricsEnabled) {
    userId = (await getUserInfo(request))?.userId;
    tenantId = await getTenantIdOrNull({ request: request, params: params });
  }

  const time: TimeFunction = async <T>(fn: Promise<T> | (() => T | Promise<T>), functionName = "_unidentifiedFunction_") => {
    if (!metricsEnabled) {
      return typeof fn === "function" ? await fn() : await fn;
    }
    const startTime = performance.now();
    let result: T;
    try {
      result = typeof fn === "function" ? await fn() : await fn;
    } catch (error) {
      throw error;
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    timings.push({ route, functionName, duration });
    return result;
  };

  const getServerTimingHeader: () => { "Server-Timing": string } = () => {
    if (!metricsEnabled) {
      return { "Server-Timing": "" };
    }

    if (metrics.logToConsole) {
      // eslint-disable-next-line no-console
      console.log("[Metrics]", {
        env,
        type,
        route,
        url,
        timings: timings
          .sort((a, b) => a.duration - b.duration)
          .reverse()
          .map((timing) => ({ [`${route ? route + "." : ""}${timing.functionName}`]: timing.duration.toFixed(3) })),
      });
    }

    if (metrics.saveToDatabase) {
      // store timings in parallel
      const promises = timings.map((timing) =>
        db.metricLog
          .create({
            data: {
              env,
              type,
              route,
              url,
              function: timing.functionName,
              duration: timing.duration,
              userId,
              tenantId,
            },
          })
          .catch((e: any) => {
            // eslint-disable-next-line no-console
            // console.error("Error saving metrics to database", {
            //   message: e.message,
            // });
            return Promise.resolve();
          })
      );
      Promise.all(promises);
    }

    const headerValue = timings.map((timing) => `${timing.functionName};dur=${timing.duration}`).join(", ");
    return { "Server-Timing": headerValue };
  };

  return { time, getServerTimingHeader };
};
