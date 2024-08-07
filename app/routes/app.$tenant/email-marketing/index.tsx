import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import EmailMarketingSummaryRoute from "~/modules/emailMarketing/components/EmailMarketingSummaryRoute";
import { EmailMarketing_Summary } from "~/modules/emailMarketing/routes/EmailMarketing_Summary";

export const loader = (args: LoaderFunctionArgs) => EmailMarketing_Summary.loader(args);

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => <EmailMarketingSummaryRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
