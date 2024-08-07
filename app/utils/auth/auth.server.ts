// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { storage } from "../session.server";
import { GoogleProfile, GoogleStrategy } from "remix-auth-google";
import { getBaseURL } from "../url.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let getAuthenticator = (request: Request) => {
  const authenticator = new Authenticator(storage);
  let googleStrategy = new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_OAUTH_SECRET_KEY || "",
      callbackURL: getBaseURL(request) + "/oauth/google/callback",
    },
    async ({ accessToken, refreshToken, extraParams, profile, ...rest }) => {
      // Get the user data from your DB or API using the tokens and profile
      return profile as GoogleProfile;
    }
  );

  authenticator.use(googleStrategy);

  return authenticator;
};
