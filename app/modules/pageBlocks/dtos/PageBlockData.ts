import { TFunction } from "i18next";
import { UserSession } from "~/utils/session.server";
import { PageConfiguration } from "./PageConfiguration";

export type PageLoaderData = PageConfiguration & {
  userSession: UserSession;
  authenticated: boolean;
  // i18n: Record<string, Language>;
  t: TFunction;
};
