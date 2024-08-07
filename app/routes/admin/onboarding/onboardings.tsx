import { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import { OnboardingIndexApi } from "~/modules/onboarding/routes/api/onboardings/OnboardingsIndexApi.server";
import OnboardingIndexRoute from "~/modules/onboarding/routes/components/onboardings/OnboardingsIndexRoute";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
export const loader = (args: LoaderFunctionArgs) => OnboardingIndexApi.loader(args);
export const action: ActionFunction = (args) => OnboardingIndexApi.action(args);

export default () => <OnboardingIndexRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
