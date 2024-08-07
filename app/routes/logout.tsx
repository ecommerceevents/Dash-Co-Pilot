import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { createLogLogout } from "~/utils/db/logs.db.server";

import { getUserInfo, logout } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  if (userInfo.userId) {
    createLogLogout(request, userInfo.userId);
  }
  return logout(request);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return logout(request);
};
