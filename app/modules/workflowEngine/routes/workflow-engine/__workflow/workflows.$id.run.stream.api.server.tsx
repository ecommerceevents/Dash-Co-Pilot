import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { WorkflowDto } from "~/modules/workflowEngine/dtos/WorkflowDto";
import WorkflowsExecutionsService from "~/modules/workflowEngine/services/WorkflowsExecutionsService";
import WorkflowsService from "~/modules/workflowEngine/services/WorkflowsService";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";

export namespace WorkflowsIdRunStreamApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    workflow: WorkflowDto;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const workflow = await WorkflowsService.get(params.id!, {
      tenantId,
    });
    if (!workflow) {
      return redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows`));
    }
    const data: LoaderData = {
      metatags: [{ title: `Run Workflow (Stream): ${workflow.name} | ${process.env.APP_NAME}` }],
      workflow,
    };
    return json(data);
  };

  export type ActionData = {
    success?: string;
    error?: string;
    executionId: string;
  };
  export const action = async ({ request, params }: ActionFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const { userId } = await getUserInfo(request);
    const form = await request.formData();
    const action = form.get("action")?.toString();
    if (action === "execute") {
      try {
        let input = form.get("input")?.toString() ?? "{}";
        let inputData: { [key: string]: any } | null = null;
        if (!input.trim()) {
          input = "{}";
        }
        if (input) {
          try {
            inputData = JSON.parse(input);
          } catch {
            throw Error("Input data is not valid JSON");
          }
        }

        const execution = await WorkflowsExecutionsService.stream(params.id!, {
          input: inputData,
          session: {
            tenantId,
            userId,
          },
        });
        return json({ executionId: execution.id });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else if (action === "continue-execution") {
      try {
        const executionId = form.get("executionId")?.toString() ?? "";
        const execution = await WorkflowsExecutionsService.continueExecution(executionId, {
          type: "manual",
          input: { input: form.get("input")?.toString() },
          session: { tenantId, userId },
        });
        if (execution.status === "error") {
          return json({ error: "Workflow execution failed: " + execution.error }, { status: 400 });
        }
        return json({ success: "Workflow executed" });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    }
    return json({ error: "Invalid action" }, { status: 400 });
  };
}
