import { MetaFunction, json } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import CodeBlock from "~/components/ui/code/CodeBlock";
import DateCell from "~/components/ui/dates/DateCell";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import TabsContainer from "~/components/ui/tabs/TabsContainer";
import RowController from "~/modules/rows/repositories/RowModel";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import ServerError from "~/components/ui/errors/ServerError";
import "highlight.js/styles/night-owl.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type LoaderData = {
  metatags: MetaTagsDto;
  companies: RowsApi.GetRowsData;
};
export const loader = async () => {
  const data: LoaderData = {
    metatags: [{ title: `RowModel | Entity Repositories | ${process.env.APP_NAME}` }],
    companies: await RowsApi.getAll({ entity: { name: "company" } }),
  };
  return json(data);
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const companies = data.companies.items.map((item) => {
    return new RowController(item);
  });
  return (
    <EditPageLayout
      withHome={false}
      title="RowModel Demo"
      menu={[
        { title: "Row Repositories and Models", routePath: "/admin/playground/repositories-and-models" },
        { title: "Model", routePath: "/admin/playground/entities/repositories-and-models/row-model" },
      ]}
    >
      <TabsContainer
        items={[
          {
            name: "Explanation",
            render: (
              <div className="prose rounded-md border border-gray-200 bg-white p-3">
                <div>This demo has the following sections:</div>
                <ol>
                  <li>
                    <b className="underline">loader</b>: Returns <code>Company</code> rows from <code>RowsApi.getAll</code>.
                  </li>
                  <li>
                    <b className="underline">component</b>: Converts the <code>RowWithDetails</code> data.items to <b>RowModel</b> to use methods like{" "}
                    <code>company.getText("name")</code>.
                  </li>
                </ol>
                <div>
                  <div>Before</div>
                  <CodeBlock code={`const name = RowValueHelper.getText({ entity, row, name: "name" });`} />
                  <div>After</div>
                  <CodeBlock code={`const name = company.getText("name");`} />
                </div>
              </div>
            ),
          },
          {
            name: "Code",
            render: <CodeBlock code={code} />,
          },
          {
            name: "Demo",
            render: (
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <TableSimple
                  items={companies}
                  headers={[
                    { name: "name", title: "Name", value: (i) => i.getText("name") },
                    {
                      name: "logo",
                      title: "Logo",
                      value: (i) => {
                        const logo = i.getMediaPublicUrlOrFile("logo");
                        if (!logo) {
                          return null;
                        }
                        return <img alt={i.toString()} className="h-8 w-auto" src={i.getMediaPublicUrlOrFile("logo")} title={i.getText("title")} />;
                      },
                    },
                    { name: "createdAt", title: "Created at", value: (i) => <DateCell date={i.row.createdAt} /> },
                    { name: "toString", title: "toString()", value: (i) => i.toString() },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}

const code = `
// imports
...

type LoaderData = {
  companies: RowsApi.GetRowsData;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    companies: await RowsApi.getAll({ entity: { name: "company" } }),
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const companies = data.companies.items.map((item) => {
    return new RowController(item);
  });
  return (
    <TableSimple
      items={companies}
      headers={[
        { name: "name", title: "Name", value: (i) => i.getText("name") },
        {
          name: "logo",
          title: "Logo",
          value: (i) => {
            const logo = i.getMediaPublicUrlOrFile("logo");
            if (!logo) {
              return null;
            }
            return <img alt={i.toString()} className="h-8 w-auto" src={i.getMediaPublicUrlOrFile("logo")} title={i.getText("title")} />;
          },
        },
        { name: "createdAt", title: "Created at", value: (i) => <DateCell date={i.row.createdAt} /> },
        { name: "toString", title: "toString()", value: (i) => i.toString() },
      ]}
    />
  );
}
`;
