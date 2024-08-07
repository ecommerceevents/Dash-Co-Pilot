import { ActionFunctionArgs, json } from "@remix-run/node";
import jwt from "jsonwebtoken";
import { getUser } from "~/utils/db/users.db.server";

export let action = async ({ request }: ActionFunctionArgs) => {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return json({ error: "No token provided" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await getUser(decoded.userId);
    if (!user) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    return json({ token: newToken, user: { id: user.id, email: user.email } });
  } catch (e: any) {
    return json({ error: "Token is not valid or expired: " + e.message }, { status: 401 });
  }
};
