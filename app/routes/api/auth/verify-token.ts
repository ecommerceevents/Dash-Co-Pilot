import { LoaderFunctionArgs, json } from "@remix-run/node";
import jwt from "jsonwebtoken";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return json({ error: "No token provided" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return json({ userId: decoded.userId, message: "Token is valid" });
  } catch (e: any) {
    return json({ error: "Token is not valid or expired: " + e.message }, { status: 401 });
  }
};
