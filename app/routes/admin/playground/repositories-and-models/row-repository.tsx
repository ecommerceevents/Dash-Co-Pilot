import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import CodeBlock from "~/components/ui/code/CodeBlock";
import InputText from "~/components/ui/input/InputText";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TabsContainer from "~/components/ui/tabs/TabsContainer";
import RowModel from "~/modules/rows/repositories/RowModel";
import RowRepository from "~/modules/rows/repositories/RowRepository.server";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { loadEntities } from "~/modules/rows/repositories/.server/EntitiesSingletonService";
import ServerError from "~/components/ui/errors/ServerError";
import "highlight.js/styles/night-owl.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type LoaderData = {
  metatags: MetaTagsDto;
  company: RowWithDetails | null;
};
export const loader = async () => {
  const companies = await RowsApi.getAll({ entity: { name: "company" } });
  const data: LoaderData = {
    metatags: [{ title: `RowModel | Entity Repositories | ${process.env.APP_NAME}` }],
    company: companies.items.length > 0 ? companies.items[0] : null,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "update") {
    const id = form.get("id")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? "";
    try {
      const { item } = await RowsApi.get(id, { entity: { name: "company" } });
      await loadEntities();
      const companyRepository = new RowRepository(item);
      await companyRepository.updateText("name", name);
      return json({ success: "Company name updated successfully." });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const company = data.company ? new RowModel(data.company) : null;

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  return (
    <EditPageLayout
      withHome={false}
      title="RowRepository Demo"
      menu={[
        { title: "Row Repositories and Models", routePath: "/admin/playground/repositories-and-models" },
        { title: "Repository", routePath: "/admin/playground/entities/repositories-and-models/row-repository" },
      ]}
    >
      <div className="space-y-2">
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
                      <b className="underline">component</b>: Converts <code>RowWithDetails</code> items to <b>RowModel</b> items to use methods like{" "}
                      <code>company.getText("name")</code>.
                    </li>
                    <li>
                      <b className="underline">action</b>: Creates a <code>companyRepository</code> and <b>updates</b> the name of the retrieved row.
                    </li>
                  </ol>
                  <div>
                    <div>Before</div>
                    <CodeBlock
                      code={`await RowValueService.update({
  entity,
  row,
  values: [{ name: "name", textValue: "New name" }],
  session,
});`}
                    />
                    <div>After</div>
                    <CodeBlock
                      code={`const companyRepository = new RowRepository(row);
await companyRepository.updateText("name", "New name");`}
                    />
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
                <div className="space-y-1 rounded-md border border-gray-200 bg-white p-3">
                  <h3 className="font-medium">Update First Company</h3>
                  <div className="space-y-1">
                    {!company ? (
                      <div>There are no companies in the database.</div>
                    ) : (
                      <Form method="post" className="space-y-2">
                        <input type="hidden" name="action" value="update" hidden readOnly />
                        <input type="hidden" name="id" value={company.row.id} hidden readOnly />
                        <InputText name="name" title="Name" defaultValue={company.getText("name")} />
                        <div className="flex justify-end">
                          <LoadingButton type="submit">Save</LoadingButton>
                        </div>
                      </Form>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
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
  company: RowWithDetails | null;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const companies = await RowsApi.getAll({ entity: { name: "company" } });
  const data: LoaderData = {
    company: companies.items.length > 0 ? companies.items[0] : null,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "update") {
    const id = form.get("id")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? "";
    try {
      const { item } = await RowsApi.get(id, { entity: { name: "company" } });
      await loadEntities();
      const companyRepository = new RowRepository(item);
      await companyRepository.updateText("name", name);
      return json({ success: "Company name updated successfully." });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const company = data.company ? new RowModel(data.company) : null;

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  return (
    <div>
      <div className="space-y-1">
        <h3 className="font-medium">Update First Company</h3>
        <div className="space-y-1">
          {!company ? (
            <div>There are no companies in the database.</div>
          ) : (
            <Form method="post" className="space-y-2">
              <input type="hidden" name="action" value="update" hidden readOnly />
              <input type="hidden" name="id" value={company.row.id} hidden readOnly />
              <InputText name="name" title="Name" value={company.getText("name")} />
              <div className="flex justify-end">
                <LoadingButton type="submit">Save</LoadingButton>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
`;
