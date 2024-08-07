import { LoaderFunctionArgs, json } from "@remix-run/node";
import Page404 from "~/components/pages/Page404";
import ServerError from "~/components/ui/errors/ServerError";
import RedirectsService from "~/modules/redirects/RedirectsService";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  RedirectsService.findAndRedirect({ request });
  return json({}, { status: 404 });
};

export default function () {
  return <Page404 />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
