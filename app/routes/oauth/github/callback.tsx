import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { createLogLogin } from "~/utils/db/logs.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getUserByEmail, getUserByGitHubID, setUserGitHubAccount, UserWithoutPassword } from "~/utils/db/users.db.server";
import { getGitHubAccessToken, getGitHubUserProfile, GitHubProfile } from "~/utils/integrations/githubService";
import { validateRegistration } from "~/utils/services/authService";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { isCompanyEmail } from "company-email-validator";
import { companyFromEmail } from "~/utils/helpers/EmailHelper";
import UrlUtils from "~/utils/app/UrlUtils";

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return badRequest({ error: "Code required in GitHub oauth flow." });
  }
  let userProfile: GitHubProfile;
  try {
    const token = await getGitHubAccessToken(code);
    userProfile = await getGitHubUserProfile(token);
  } catch (e: any) {
    return badRequest({ error: e.message });
  }
  // If user already exists -> Sign in
  let user = await getUserByGitHubID(userProfile.id);
  if (user) {
    return signInGithubUser(request, user);
  } else {
    user = await getUserByEmail(userProfile.email);
    if (user) {
      // we already have a user with this email -> Link the github account
      await setUserGitHubAccount({ githubId: userProfile.id }, user.id);
      return signInGithubUser(request, user);
    }
  }
  // No user yet -> Sign up
  return signUpGithubUser(request, userProfile);
};

const signInGithubUser = async (request: Request, user: UserWithoutPassword) => {
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
    user.admin !== null ? "/admin/dashboard" : `/app/${tenant?.slug ?? tenant?.id}/dashboard`
  );
};

const signUpGithubUser = async (request: Request, userProfile: GitHubProfile) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const [firstName, lastName] = userProfile.name?.split(" ") ?? ["", ""];
  let company = userProfile.company;
  if (!company) {
    if (isCompanyEmail(userProfile.email)) {
      // Use email as company
      company = companyFromEmail(userProfile.email);
    } else {
      company = UrlUtils.slugify(firstName + " " + lastName);
    }
  }
  const result = await validateRegistration({
    request,
    registrationData: {
      email: userProfile.email,
      firstName: firstName,
      lastName: lastName,
      company: userProfile.company ?? UrlUtils.slugify(userProfile.email.split("@")[0]),
      avatarURL: userProfile.avatarURL,
    },
    checkEmailVerification: false,
    stripeCustomerId: undefined,
    githubId: userProfile.id,
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
