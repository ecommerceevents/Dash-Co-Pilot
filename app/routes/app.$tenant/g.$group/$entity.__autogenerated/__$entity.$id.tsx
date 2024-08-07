import { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import RowOverviewRoute from "~/modules/rows/components/RowOverviewRoute";
import ServerError from "~/components/ui/errors/ServerError";
import { Rows_Overview } from "~/modules/rows/routes/Rows_Overview.server";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
export { serverTimingHeaders as headers };

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta || [];
export const loader = (args: LoaderFunctionArgs) => Rows_Overview.loader(args);
export const action: ActionFunction = (args) => Rows_Overview.action(args);

export default function () {
  const data = useTypedLoaderData<Rows_Overview.LoaderData>();
  const actionData = useTypedActionData<Rows_Overview.ActionData>();
  return (
    <RowOverviewRoute
      rowData={data.rowData}
      item={actionData?.updatedRow?.item ?? data.rowData.item}
      routes={data.routes}
      relationshipRows={data.relationshipRows}
    />
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
