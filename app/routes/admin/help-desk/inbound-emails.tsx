import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { loaderEmails } from "~/modules/emails/loaders/inbound-emails";
import InboundEmailsRoute from "~/modules/emails/routes/InboundEmailsRoute";
import { actionInboundEmails } from "~/modules/emails/actions/inbound-emails";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  return json(await loaderEmails(request, params, null));
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionInboundEmails(request, params, null);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default InboundEmailsRoute;
