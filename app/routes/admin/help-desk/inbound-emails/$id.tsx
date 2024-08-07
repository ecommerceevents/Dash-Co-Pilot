import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { actionInboundEmailEdit } from "~/modules/emails/actions/inbound-email-edit";
import { loaderEmailEdit } from "~/modules/emails/loaders/inbound-email-edit";
import InboundEmailRoute from "~/modules/emails/routes/InboundEmailEditRoute";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  return json(await loaderEmailEdit(request, params, null, "/admin/help-desk/inbound-emails"));
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionInboundEmailEdit(request, params, "/admin/help-desk/inbound-emails");
};

export default InboundEmailRoute;
