import { LoaderFunctionArgs, json } from "@remix-run/node";
import jwt from "jsonwebtoken";
import { getUser } from "~/utils/db/users.db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return json({ error: "No token provided" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await getUser(decoded.userId);
    return json({ user });
  } catch (e: any) {
    return json({ error: "Token is not valid or expired: " + e.message }, { status: 401 });
  }
};
