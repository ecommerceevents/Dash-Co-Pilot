import { LoaderFunction, redirect } from "@remix-run/node";
import { getMyTenants } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";

let redirectTo = "dashboard";
export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user) {
    throw redirect(`/login`);
  }
  const myTenants = await getMyTenants(userInfo.userId);
  if (myTenants.length === 0 && user.admin) {
    return redirect("/admin");
  } else if (myTenants.length > 0) {
    try {
      return redirect("/app/" + encodeURIComponent(myTenants[0].slug) + "/" + redirectTo);
    } catch (e) {}
  }
  return redirect("/app");
};
