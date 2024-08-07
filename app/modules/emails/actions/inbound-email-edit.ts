import { json, redirect } from "@remix-run/node";
import { deleteEmail } from "~/utils/db/email/emails.db.server";
import { Params } from "react-router";
import { getTranslations } from "~/locale/i18next.server";

export type ActionDataEmails = {
  error?: string;
};
const badRequest = (data: ActionDataEmails) => json(data, { status: 400 });
export const actionInboundEmailEdit = async (request: Request, params: Params, redirectUrl: string) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();

  const action = form.get("action");
  if (action === "delete") {
    await deleteEmail(params.id ?? "");
    return redirect(redirectUrl);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};
