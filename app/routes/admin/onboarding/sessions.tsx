import { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { OnboardingSessionsIndexApi } from "~/modules/onboarding/routes/api/sessions/OnboardingSessionsIndexApi.server";
import OnboardingSessionsIndexRoute from "~/modules/onboarding/routes/components/sessions/OnboardingSessionsIndexRoute";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
export const loader = (args: LoaderFunctionArgs) => OnboardingSessionsIndexApi.loader(args);
export const action: ActionFunction = (args) => OnboardingSessionsIndexApi.action(args);

export default () => (
  <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
    <OnboardingSessionsIndexRoute />
  </div>
);

export function ErrorBoundary() {
  return <ServerError />;
}
