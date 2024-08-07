import { ActionFunctionArgs, json } from "@remix-run/node";
import { createLogLogin } from "~/utils/db/logs.db.server";
import { getUserByEmail } from "~/utils/db/users.db.server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getTranslations } from "~/locale/i18next.server";

export let action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: t("shared.invalidRequest") }, { status: 400 });
    }
    const email = body.email;
    const password = body.password;

    if (typeof email !== "string" || typeof password !== "string") {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isCorrectPassword) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }

    await createLogLogin(request, user);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    return json({ token, user: { id: user.id, email: user.email } });
  } catch (e: any) {
    return json(
      {
        error: e.message,
        stack: e.stack,
      },
      { status: 401 }
    );
  }
};
