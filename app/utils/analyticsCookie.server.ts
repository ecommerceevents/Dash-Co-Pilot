import { createCookieSessionStorage, redirect, Session } from "@remix-run/node";
import { randomBytes } from "crypto";

export type AnalyticsSession = {
  userAnalyticsId: string;
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "saasrock_analytics",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getAnalyticsSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getAnalyticsInfo(request: Request): Promise<AnalyticsSession> {
  const session = await getAnalyticsSession(request);
  const userAnalyticsId = session.get("userAnalyticsId") ?? null;
  return {
    userAnalyticsId,
  };
}

export async function createAnalyticsSession(analyticsSession: AnalyticsSession, redirectTo = "/") {
  const session = await storage.getSession();
  session.set("userAnalyticsId", analyticsSession.userAnalyticsId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function commitAnalyticsSession(session: Session) {
  return await storage.commitSession(session);
}

export async function destroyAnalyticsSession(session: Session) {
  return await storage.destroySession(session);
}

export function generateAnalyticsUserId() {
  return randomBytes(100).toString("base64");
}
