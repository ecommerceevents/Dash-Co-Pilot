import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";

type LoaderData = {
  metatags: MetaTagsDto;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    metatags: [{ title: `Row Repositories and Models | ${process.env.APP_NAME}` }],
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export default function () {
  return (
    <EditPageLayout title="Row Repositories and Models">
      <p className="text-sm text-gray-600">
        This page is a demo collection for <b>RowRepository</b> and <b>RowModel</b>.
      </p>
      <div className="grid gap-3">
        <Link
          to="row-repository"
          className="group space-y-2 rounded-md border-2 border-dashed border-gray-300 bg-white p-3 hover:border-dotted hover:bg-gray-50"
        >
          <b className="font-bold text-gray-800 group-hover:underline">RowRepository</b>
          <p className="text-sm">
            <b>Server-side</b> repository for an entity type. It has the following methods:
          </p>
          <div className="rounded-md border border-gray-200 bg-gray-100 p-1">
            <span className="text-xs">
              <code>updateMany</code>, <code>updateText</code>, <code>updateNumber</code>, <code>updateBoolean</code>, <code>updateDate</code>,{" "}
              <code>updateMedia</code>, <code>updateMultiple</code>, <code>updateRange</code>, <code>addChild</code>, <code>removeChild</code>,{" "}
              <code>addParent</code>, <code>removeParent</code>
            </span>
          </div>
          <div className="prose">
            <pre>{`await company.updateText("status", "active");`}</pre>
          </div>
        </Link>
        <Link to="row-model" className="group space-y-2 rounded-md border-2 border-dashed border-gray-300 bg-white p-3 hover:border-dotted hover:bg-gray-50">
          <b className="font-bold text-gray-800 group-hover:underline">RowModel</b>
          <p className="text-sm">
            <b>Client and server-side</b> model to interact with a row. It has the following methods:
          </p>
          <div className="rounded-md border border-gray-200 bg-gray-100 p-1">
            <span className="text-xs">
              <code>getText</code>, <code>getBoolean</code>, <code>getNumber</code>, <code>getDate</code>, <code>getMedia</code>, <code>getFirstMedia</code>,{" "}
              <code>getMediaPublicUrl</code>, <code>getMediaPublicUrlOrFile</code>, <code>getSelected</code>, <code>getMultiple</code>,{" "}
              <code>getNumberRange</code>, <code>getDateRange</code>
            </span>
          </div>
          <div className="prose">
            <pre>{`const status = company.getText("status");`}</pre>
          </div>
        </Link>
      </div>
    </EditPageLayout>
  );
}
