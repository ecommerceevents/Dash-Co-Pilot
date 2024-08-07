import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { getTranslations } from "~/locale/i18next.server";
import UserUtils from "../app/UserUtils";
import { getAppConfiguration } from "../db/appConfiguration.db.server";
import { getAllRoles } from "../db/permissions/roles.db.server";
import { createTenant, createTenantUser, getTenantBySlug } from "../db/tenants.db.server";
import { getUserByEmail, register } from "../db/users.db.server";
import { sendEmail } from "../email.server";
import { createStripeCustomer } from "../stripe.server";
import crypto from "crypto";
import { createRegistration, getRegistrationByEmail, updateRegistration } from "../db/registration.db.server";
import { getClientIPAddress } from "~/utils/server/IpUtils";
import { addBlacklistAttempt, findInBlacklist } from "../db/blacklist.db.server";
import { getBaseURL } from "../url.server";
import { getUserInfo } from "../session.server";
import { TenantTypesApi } from "../api/.server/TenantTypesApi";
import EventsService from "../../modules/events/services/.server/EventsService";
import { AccountCreatedDto } from "~/modules/events/dtos/AccountCreatedDto";
import { autosubscribeToTrialOrFreePlan } from "./.server/pricingService";
import IpAddressServiceServer from "~/modules/ipAddress/services/IpAddressService.server";

export type RegistrationData = {
  email?: string;
  password?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  avatarURL?: string;
  slug?: string;
};

export async function getRegistrationFormData(request: Request): Promise<RegistrationData> {
  const formData = await request.formData();
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();
  const company = formData.get("company")?.toString();
  const firstName = formData.get("first-name")?.toString();
  const lastName = formData.get("last-name")?.toString();
  const slug = formData.get("slug")?.toString();

  const ipError = await IpAddressServiceServer.log(request, {
    action: "register",
    description: email ?? "{empty email}",
    metadata: { email, password, company, firstName, lastName, slug },
  }).catch((e) => e.message);
  if (ipError) {
    throw Error(ipError);
  }

  return { email, password, company, firstName, lastName, slug };
}

export async function validateRegistration({
  request,
  registrationData,
  addToTrialOrFreePlan,
  checkEmailVerification = true,
  stripeCustomerId,
  githubId,
  googleId,
}: {
  request: Request;
  registrationData: RegistrationData;
  addToTrialOrFreePlan: boolean;
  checkEmailVerification?: boolean;
  stripeCustomerId?: string;
  githubId?: string;
  googleId?: string;
}) {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const appConfiguration = await getAppConfiguration({ request });
  const { email, password, company, firstName, lastName, avatarURL, slug } = registrationData;
  if (!email || !UserUtils.validateEmail(email)) {
    throw Error(t("account.register.errors.invalidEmail"));
  }
  if (!githubId && !googleId) {
    if (!appConfiguration.auth.requireEmailVerification && !UserUtils.validatePassword(password)) {
      throw Error(t("account.register.errors.passwordRequired"));
    } else if (appConfiguration.auth.requireOrganization && typeof company !== "string") {
      throw Error(t("account.register.errors.organizationRequired"));
    } else if (appConfiguration.auth.requireName && (typeof firstName !== "string" || typeof lastName !== "string")) {
      throw Error(t("account.register.errors.nameRequired"));
    }
  }

  if (company && company.length > 100) {
    throw Error("Maximum length for company name is 100 characters");
  } else if (firstName && firstName.length > 50) {
    throw Error("Maximum length for first name is 50 characters");
  } else if (lastName && lastName.length > 50) {
    throw Error("Maximum length for last name is 50 characters");
  }

  const ipAddress = getClientIPAddress(request.headers)?.toString() ?? "";
  // eslint-disable-next-line no-console
  console.log("[REGISTRATION ATTEMPT]", { email, domain: email.substring(email.lastIndexOf("@") + 1), ipAddress });

  const blacklistedEmail = await findInBlacklist("email", email);
  if (blacklistedEmail) {
    await addBlacklistAttempt(blacklistedEmail);
    throw Error(t("account.register.errors.blacklist.email"));
  }
  const blacklistedDomain = await findInBlacklist("domain", email.substring(email.lastIndexOf("@") + 1));
  if (blacklistedDomain) {
    await addBlacklistAttempt(blacklistedDomain);
    throw Error(t("account.register.errors.blacklist.domain"));
  }
  const blacklistedIp = await findInBlacklist("ip", ipAddress);
  if (blacklistedIp) {
    await addBlacklistAttempt(blacklistedIp);
    throw Error(t("account.register.errors.blacklist.ip"));
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw Error(t("api.errors.userAlreadyRegistered"));
  }

  if (appConfiguration.auth.slug?.require) {
    if (!slug) {
      throw Error(appConfiguration.auth.slug.type === "tenant" ? "Slug is required" : "Username is required");
    }
    const existingTenant = await getTenantBySlug(slug);
    if (existingTenant) {
      throw Error(appConfiguration.auth.slug.type === "tenant" ? "Slug is already taken" : "Username is already taken");
    }
  }
  if (checkEmailVerification && appConfiguration.auth.requireEmailVerification) {
    return { email, ipAddress, verificationRequired: true };
  }
  const locale = userInfo.lng;
  const registered = await createUserAndTenant({
    request,
    email,
    password,
    company,
    firstName,
    lastName,
    stripeCustomerId,
    githubId,
    googleId,
    avatarURL,
    locale,
    slug,
  });
  if (addToTrialOrFreePlan) {
    await autosubscribeToTrialOrFreePlan({ request, t, tenantId: registered.tenant.id, userId: registered.user.id });
  }
  return { email, ipAddress, verificationRequired: false, registered };
}

interface CreateRegistrationFormDto {
  request: Request;
  email: string;
  ipAddress: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  recreateToken?: boolean;
  slug?: string;
}
export async function createRegistrationForm({ request, email, company, firstName, lastName, ipAddress, recreateToken, slug }: CreateRegistrationFormDto) {
  const registration = await getRegistrationByEmail(email);
  if (registration) {
    if (registration.createdTenantId) {
      throw Error("api.errors.userAlreadyRegistered");
    } else {
      if (recreateToken) {
        const newToken = crypto.randomBytes(20).toString("hex");
        await updateRegistration(registration.id, {
          firstName,
          lastName,
          company,
          token: newToken,
        });
        await sendEmail({
          request,
          to: email,
          alias: "email-verification",
          data: {
            action_url: getBaseURL(request) + `/verify/` + newToken,
            email: email,
            first_name: firstName ?? "",
            last_name: lastName ?? "",
            company,
          },
        });
      }
    }
  } else {
    var token = crypto.randomBytes(20).toString("hex");
    await createRegistration({
      email,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      company: company ?? "",
      token,
      selectedSubscriptionPriceId: null,
      ipAddress,
      slug: slug ?? null,
    });
    await sendEmail({
      request,
      to: email,
      alias: "email-verification",
      data: {
        action_url: getBaseURL(request) + `/verify/` + token,
        first_name: firstName,
        last_name: lastName,
        email,
        company,
      },
    });
  }
}

interface CreateUserAndTenantDto {
  request: Request;
  email: string;
  password?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
  githubId?: string;
  googleId?: string;
  avatarURL?: string;
  locale?: string;
  slug?: string;
}
export async function createUserAndTenant({
  request,
  email,
  password,
  company,
  firstName,
  lastName,
  stripeCustomerId,
  githubId,
  googleId,
  avatarURL,
  locale,
  slug,
}: CreateUserAndTenantDto) {
  let tenantName = company ?? email.split("@")[0];
  if (!stripeCustomerId && process.env.STRIPE_SK) {
    const stripeCustomer = await createStripeCustomer(email, tenantName);
    if (!stripeCustomer) {
      throw Error("Could not create Stripe customer");
    }
    stripeCustomerId = stripeCustomer.id;
  }
  const tenant = await createTenant({ name: tenantName, subscriptionCustomerId: stripeCustomerId, slug });
  if (!tenant) {
    throw Error("Could not create tenant");
  }
  const user = await register({
    email: email,
    password: password ?? "",
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    githubId,
    googleId,
    avatarURL,
    locale,
    defaultTenantId: tenant.id,
    request,
  });
  if (!user) {
    throw Error("Could not create user");
  }
  const roles = await getAllRoles("app");
  await createTenantUser(
    {
      tenantId: tenant.id,
      userId: user.id,
      type: TenantUserType.OWNER,
    },
    roles
  );
  await TenantTypesApi.setTenantTypes({ tenantId: tenant.id });

  await sendEmail({
    request,
    to: email,
    alias: "welcome",
    data: {
      action_url: getBaseURL(request) + `/login`,
      name: firstName,
    },
  });

  await EventsService.create({
    request,
    event: "account.created",
    tenantId: tenant.id,
    userId: user.id,
    data: {
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      user: { id: user.id, email: user.email },
    } satisfies AccountCreatedDto,
  });

  return { user, tenant };
}
