import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { WorkflowsTemplateDto } from "~/modules/workflowEngine/dtos/WorkflowsTemplateDto";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import WorkflowEngineTemplatesService from "~/modules/workflowEngine/services/WorkflowsTemplatesService";
import { getWorkflowById } from "~/modules/workflowEngine/db/workflows.db.server";
import WorkflowsService from "~/modules/workflowEngine/services/WorkflowsService";
import { WorkflowDto } from "~/modules/workflowEngine/dtos/WorkflowDto";
import UrlUtils from "~/utils/app/UrlUtils";
import { getAllWorkflowVariables } from "~/modules/workflowEngine/db/workflowVariable.db.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { getUserInfo } from "~/utils/session.server";

export namespace WorkflowsIndexApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    items: WorkflowDto[];
    template: WorkflowsTemplateDto;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const items = await WorkflowsService.getAll({ tenantId });
    const variables = await getAllWorkflowVariables({ tenantId });
    const data: LoaderData = {
      metatags: [{ title: `Workflows | ${process.env.APP_NAME}` }],
      items,
      template: await WorkflowEngineTemplatesService.getTemplate(items, variables),
    };
    return json(data);
  };

  export type ActionData = {
    success?: string;
    error?: string;
  };
  export const action = async ({ request, params }: ActionFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const { userId } = await getUserInfo(request);
    const form = await request.formData();
    const action = form.get("action")?.toString();
    if (action === "toggle-status") {
      const id = form.get("id")?.toString() ?? "";

      const item = await getWorkflowById({ id, tenantId });
      if (!item) {
        return json({ error: "Not found" }, { status: 404 });
      }

      if (item.status === "draft") {
        await WorkflowsService.update(item.id, { status: "live" }, { tenantId });
        return json({ success: "Workflow is now live" });
      } else {
        await WorkflowsService.update(
          item.id,
          {
            status: "draft",
          },
          { tenantId }
        );
        return json({ success: "Workflow is now draft" });
      }
    } else if (action === "create") {
      const { id } = await WorkflowsService.create({ tenantId, userId });
      return redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows/${id}`));
    } else if (action === "delete") {
      const id = form.get("id")?.toString() ?? "";
      await WorkflowsService.del(id, { tenantId });
      return redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows`));
    } else {
      return json({ error: "Invalid form" }, { status: 400 });
    }
  };
}
