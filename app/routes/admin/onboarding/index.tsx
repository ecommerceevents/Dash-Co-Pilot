import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { OnboardingSummaryApi } from "~/modules/onboarding/routes/api/OnboardingSummaryApi.server";
import OnboardingOverviewRoute from "~/modules/onboarding/routes/components/OnboardingSummaryRoute";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
export const loader = (args: LoaderFunctionArgs) => OnboardingSummaryApi.loader(args);

export default () => <OnboardingOverviewRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
