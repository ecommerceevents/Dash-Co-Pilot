import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import ServerError from "~/components/ui/errors/ServerError";
import RowTagsRoute from "~/modules/rows/components/RowTagsRoute";
import { Rows_Tags } from "~/modules/rows/routes/Rows_Tags.server";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
export { serverTimingHeaders as headers };

export const loader = (args: LoaderFunctionArgs) => Rows_Tags.loader(args);
export const action: ActionFunction = (args) => Rows_Tags.action(args);

export default () => <RowTagsRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
