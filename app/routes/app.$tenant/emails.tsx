import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { loaderEmails } from "~/modules/emails/loaders/inbound-emails";
import InboundEmailsRoute from "~/modules/emails/routes/InboundEmailsRoute";
import { actionInboundEmails } from "~/modules/emails/actions/inbound-emails";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdFromUrl(params);
  return json(await loaderEmails(request, params, tenantId));
};

export const action: ActionFunction = async ({ request, params }) => {
  const tenantId = await getTenantIdFromUrl(params);
  return await actionInboundEmails(request, params, tenantId);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default InboundEmailsRoute;
