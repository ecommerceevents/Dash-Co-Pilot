// app/routes/auth/google/callback.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getUserByGoogleID, UserWithoutPassword, getUserByEmail, setUserGoogleAccount } from "~/utils/db/users.db.server";
import { getAuthenticator } from "../../utils/auth/auth.server";
import { createLogLogin } from "~/utils/db/logs.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { GoogleProfile } from "remix-auth-google";
import { getTranslations } from "~/locale/i18next.server";
import { isCompanyEmail } from "company-email-validator";
import { companyFromEmail } from "~/utils/helpers/EmailHelper";
import { validateRegistration } from "~/utils/services/authService";
import UrlUtils from "~/utils/app/UrlUtils";
type ActionData = {
  error?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let profile = await getAuthenticator(request).authenticate("google", request, {
    failureRedirect: "/login",
  });
  const { id, emails } = profile as GoogleProfile;
  const email = emails[0]["value"];
  let user = await getUserByGoogleID(id);
  if (user) {
    return signInGoogleUser(request, user);
  } else {
    user = await getUserByEmail(email);
    if (user) {
      // we already have a user with this email -> Link the github account
      await setUserGoogleAccount({ googleId: id }, user.id);
      return signInGoogleUser(request, user);
    }
  }
  return signUpGoogleUser(request, profile as GoogleProfile);
};

const signInGoogleUser = async (request: Request, user: UserWithoutPassword) => {
  await createLogLogin(request, user);
  const userInfo = await getUserInfo(request);
  const userSession = await setLoggedUser(user);
  const tenant = await getTenant(userSession.defaultTenantId);
  return createUserSession(
    {
      ...userInfo,
      ...userSession,
      lng: user.locale ?? userInfo.lng,
    },
    user.admin !== null ? "/admin/dashboard" : `/app/${tenant?.slug}/dashboard`
  );
};

const signUpGoogleUser = async (request: Request, userProfile: GoogleProfile) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const { givenName: firstName, familyName: lastName } = userProfile.name ?? {};
  const email = userProfile.emails[0]["value"];
  const avatarURL = userProfile.photos[0]["value"];
  let company;
  if (isCompanyEmail(email)) {
    // Use email as company
    company = companyFromEmail(email);
  } else {
    company = UrlUtils.slugify(firstName + " " + lastName);
  }
  const result = await validateRegistration({
    request,
    registrationData: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      company: company,
      avatarURL: avatarURL,
    },
    checkEmailVerification: false,
    stripeCustomerId: undefined,
    githubId: undefined,
    googleId: userProfile.id,
    addToTrialOrFreePlan: true,
  });
  if (result.registered) {
    const userSession = await setLoggedUser(result.registered.user);
    return createUserSession(
      {
        ...userInfo,
        ...userSession,
        lng: result.registered.user.locale ?? userInfo.lng,
      },
      `/app/${encodeURIComponent(result.registered.tenant.slug)}/dashboard`
    );
  }
  return badRequest({ error: t("shared.unknownError") });
};
