import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { PromptFlowWithDetails, getPromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  item: PromptFlowWithDetails;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const item = await getPromptFlow(params.id!);
  await verifyUserHasPermission(request, "admin.prompts.view");
  if (!item) {
    return redirect("/admin/prompts/builder");
  }
  const data: LoaderData = {
    item,
  };
  return json(data);
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <EditPageLayout
      title={data.item.title}
      menu={[
        { title: "Prompts", routePath: "/admin/prompts/builder" },
        { title: data.item.title, routePath: `/admin/prompts/builder/${data.item.id}` },
      ]}
      withHome={false}
    >
      <Outlet />
    </EditPageLayout>
  );
}
