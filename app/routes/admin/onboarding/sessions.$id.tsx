import { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { OnboardingSessionOverviewApi } from "~/modules/onboarding/routes/api/sessions/OnboardingSessionOverviewApi.server";
import OnboardingSessionOverviewRoute from "~/modules/onboarding/routes/components/sessions/OnboardingSessionOverviewRoute";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
export const loader = (args: LoaderFunctionArgs) => OnboardingSessionOverviewApi.loader(args);
export const action: ActionFunction = (args) => OnboardingSessionOverviewApi.action(args);

export default () => <OnboardingSessionOverviewRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
