import { WorkflowCredential } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { deleteWorkflowCredential, getAllWorkflowCredentials } from "~/modules/workflowEngine/db/workflowCredentials.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

export namespace WorkflowsCredentialsApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    items: WorkflowCredential[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const items = await getAllWorkflowCredentials({ tenantId });
    const data: LoaderData = {
      metatags: [{ title: `Workflow Credentials | ${process.env.APP_NAME}` }],
      items,
    };
    return json(data);
  };

  export const action = async ({ request, params }: ActionFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const form = await request.formData();
    const action = form.get("action")?.toString();
    if (action === "delete") {
      const id = form.get("id")?.toString() ?? "";
      await deleteWorkflowCredential(id, { tenantId });
      return redirect(UrlUtils.getModulePath(params, `workflow-engine/credentials`));
    } else {
      return json({ error: "Invalid form" }, { status: 400 });
    }
  };
}
