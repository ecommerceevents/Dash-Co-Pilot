import { json } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import UserUtils from "~/utils/app/UserUtils";
import { createLogLogin } from "~/utils/db/logs.db.server";
import { getUserByEmail } from "~/utils/db/users.db.server";
import { setLoggedUser, createUserSession, getUserInfo, validateCSRFToken } from "~/utils/session.server";
import bcrypt from "bcryptjs";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getRegistrationFormData, validateRegistration, createRegistrationForm } from "~/utils/services/authService";
import { getRegistrationByToken } from "~/utils/db/registration.db.server";
import { Params } from "@remix-run/react";
import IpAddressServiceServer from "~/modules/ipAddress/services/IpAddressService.server";

async function getHome({ isAdmin, tenantId, request }: { isAdmin: boolean; tenantId: string; request: Request }) {
  let appHome = "";
  const appConfiguration = await getAppConfiguration({ request });
  if (isAdmin) {
    appHome = "/admin/dashboard";
  } else if (appConfiguration.app.features.tenantHome === "/app/:tenant/") {
    const tenant = await getTenant(tenantId);
    if (tenant) {
      appHome = `/app/${encodeURIComponent(tenant.slug)}/dashboard`;
    } else {
      appHome = "/app";
    }
  } else {
    appHome = "/";
  }
  return appHome;
}

async function loginFromRequest(request: Request, form: FormData) {
  const userInfo = await getUserInfo(request);
  const { t } = await getTranslations(request);
  const email = form.get("email")?.toString().toLowerCase().trim();
  const password = form.get("password");
  const redirectTo = form.get("redirectTo");
  if (typeof email !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
    throw new Error("Invalid form data");
  }

  const fields = { email, password };
  const fieldErrors = {
    email: !UserUtils.validateEmail(email) ? "Invalid email" : undefined,
    password: !UserUtils.validatePassword(password) ? "Invlaid password" : undefined,
  };
  if (Object.values(fieldErrors).some(Boolean)) throw json({ fieldErrors, fields }, { status: 400 });

  const user = await getUserByEmail(email);
  if (process.env.NODE_ENV !== "development") {
    const ipError = await IpAddressServiceServer.log(request, { action: "login", description: email }).catch((e) => e.message);
    if (ipError) {
      return json({ error: ipError }, { status: 400 });
    }

    const testAccounts = ["admin@email.com", "john.doe@company.com", "luna.davis@company.com", "alex.martinez@company.com"];
    if (testAccounts.includes(email)) {
      return json({ fields: { email, password }, error: "You cannot use this account in production." }, { status: 400 });
    }
  }
  if (!user) {
    return json({ fields, error: t("api.errors.invalidPassword") }, { status: 400 });
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) {
    return json({ fields, error: t("api.errors.invalidPassword") }, { status: 400 });
  }

  await createLogLogin(request, user);
  const userSession = await setLoggedUser(user);
  // const tenant = await getTenant(userSession.defaultTenantId);
  const appHome = await getHome({
    isAdmin: !!user.admin,
    tenantId: userSession.defaultTenantId,
    request,
  });
  return createUserSession(
    {
      ...userInfo,
      ...userSession,
      lng: user.locale ?? userInfo.lng,
    },
    redirectTo.length > 0 ? redirectTo : appHome
  );
}

async function registerFromRequest(request: Request) {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  try {
    await validateCSRFToken(request);
    const registrationData = await getRegistrationFormData(request);
    const result = await validateRegistration({ request, registrationData, addToTrialOrFreePlan: true });
    if (result.verificationRequired) {
      await createRegistrationForm({ ...registrationData, email: result.email, ipAddress: result.ipAddress, recreateToken: false, request });
      return json({ verificationEmailSent: true });
    } else if (result.registered) {
      const userSession = await setLoggedUser(result.registered.user);
      const home = await getHome({
        isAdmin: false,
        tenantId: userSession.defaultTenantId,
        request,
      });
      return createUserSession(
        {
          ...userInfo,
          ...userSession,
          lng: result.registered.user.locale ?? userInfo.lng,
        },
        home
      );
    }
    return json({ error: t("shared.unknownError") }, { status: 400 });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    return json({ error: t(e.message) }, { status: 400 });
  }
}

async function verifyFromRequest({ request, params }: { request: Request; params: Params }) {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);

  const registration = await getRegistrationByToken(params.id ?? "");
  if (!registration || registration.createdTenantId) {
    return json({ error: t("api.errors.userAlreadyRegistered") }, { status: 400 });
  }

  try {
    const registrationData = await getRegistrationFormData(request);
    const result = await validateRegistration({ request, registrationData, checkEmailVerification: false, addToTrialOrFreePlan: true });
    if (!result.registered) {
      return json({ error: t("shared.unknownError") }, { status: 400 });
    }
    const userSession = await setLoggedUser(result.registered.user);
    const appHome = await getHome({
      isAdmin: false,
      tenantId: userSession.defaultTenantId,
      request,
    });
    return createUserSession(
      {
        ...userInfo,
        ...userSession,
        lng: result.registered.user.locale ?? userInfo.lng,
      },
      appHome
    );
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
}

export default {
  loginFromRequest,
  registerFromRequest,
  verifyFromRequest,
};
