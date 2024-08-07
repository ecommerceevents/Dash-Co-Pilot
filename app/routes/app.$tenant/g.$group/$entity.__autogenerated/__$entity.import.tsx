import { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import RowsImportRoute from "~/modules/rows/components/RowsImportRoute";
import { Rows_Import } from "~/modules/rows/routes/Rows_Import.server";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
export { serverTimingHeaders as headers };

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
export const loader = (args: LoaderFunctionArgs) => Rows_Import.loader(args);
export const action: ActionFunction = (args) => Rows_Import.action(args);

export default () => <RowsImportRoute />;
