import { createCookieSessionStorage, redirect, Session } from "@remix-run/node";
import { URLSearchParams } from "url";
import { getMyTenants, getTenant } from "./db/tenants.db.server";
import { randomBytes } from "crypto";

export type UserSession = {
  userId: string;
  lightOrDarkMode: string;
  lng: string;
  crsf?: string;
  cookies: { category: string; allowed: boolean }[];
  metrics?: {
    enabled: boolean;
    logToConsole: boolean;
    saveToDatabase: boolean;
    ignoreUrls: string[];
  };
  impersonatingFromUserId?: string;
  theme?: string;
};

export async function setLoggedUser(user: { id: string; email: string; defaultTenantId: string | null }) {
  const userTenants = await getMyTenants(user.id);

  let currentTenantId = "";

  if (user.defaultTenantId) {
    const tenant = await getTenant(user.defaultTenantId);
    if (tenant) {
      return {
        userId: user.id,
        defaultTenantId: tenant.id,
      };
    }
  }

  if (userTenants.length > 0) {
    const tenant = userTenants[0];
    currentTenantId = tenant.id;
  }

  return {
    userId: user.id,
    defaultTenantId: currentTenantId,
  };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
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

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserInfo(request: Request): Promise<UserSession> {
  const session = await getUserSession(request);
  const userId = session.get("userId") ?? null;
  const lightOrDarkMode = session.get("lightOrDarkMode") ?? "";
  const lng = session.get("lng") ?? "en";
  const crsf = session.get("crsf");
  const metrics = session.get("metrics") ?? { enabled: false, logToConsole: false, saveToDatabase: false, ignoreUrls: [] };
  const cookies = session.get("cookies") ?? [];
  const impersonatingFromUserId = session.get("impersonatingFromUserId");
  const theme = session.get("theme");
  return {
    userId,
    lightOrDarkMode,
    lng,
    crsf,
    metrics,
    cookies,
    impersonatingFromUserId,
    theme,
  };
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  session.set("userId", undefined);
  session.set("lightOrDarkMode", undefined);
  session.set("lng", undefined);
  session.set("crsf", undefined);
  session.set("metrics", undefined);
  session.set("cookies", session.get("cookies"));
  session.set("impersonatingFromUserId", undefined);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function createUserSession(userSession: UserSession, redirectTo: string = "") {
  const session = await storage.getSession();
  session.set("userId", userSession.userId);
  session.set("lightOrDarkMode", userSession.lightOrDarkMode);
  session.set("lng", userSession.lng);
  session.set("crsf", userSession.crsf);
  session.set("metrics", userSession.metrics);
  session.set("cookies", userSession.cookies);
  session.set("impersonatingFromUserId", userSession.impersonatingFromUserId);
  session.set("theme", userSession.theme);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function commitSession(session: Session) {
  return await storage.commitSession(session);
}

export function generateCSRFToken() {
  return randomBytes(100).toString("base64");
}

export async function validateCSRFToken(request: Request) {
  const session = await getUserSession(request);
  // first we parse the body, be sure to clone the request so you can parse the body again in the future
  let body = Object.fromEntries(new URLSearchParams(await request.clone().text()).entries()) as { csrf?: string };
  // then we throw an error if one of our validations didn't pass
  if (!session.has("csrf")) throw new Error("CSRF Session Token not included.");
  if (!body.csrf) throw new Error("CSRF Request Token not included.");
  if (body.csrf !== session.get("csrf")) throw new Error("CSRF tokens do not match, try refreshing the page.");
  // we don't need to return anything, if the validation fail it will throw an error
}
