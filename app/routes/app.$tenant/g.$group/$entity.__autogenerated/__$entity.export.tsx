import { LoaderFunctionArgs } from "@remix-run/node";
import { Rows_Export } from "~/modules/rows/routes/Rows_Export.server";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
export { serverTimingHeaders as headers };

export const loader = (args: LoaderFunctionArgs) => Rows_Export.loader(args);
