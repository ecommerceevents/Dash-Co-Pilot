import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { WorkflowDto } from "~/modules/workflowEngine/dtos/WorkflowDto";
import { WorkflowExecutionDto } from "~/modules/workflowEngine/dtos/WorkflowExecutionDto";
import WorkflowsService from "~/modules/workflowEngine/services/WorkflowsService";
import UrlUtils from "~/utils/app/UrlUtils";
import { getApiKeys } from "~/utils/db/apiKeys.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getBaseURL } from "~/utils/url.server";

export namespace WorkflowsIdRunApiApi {
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
      metatags: [{ title: `Run Workflow (API): ${workflow.name} | ${process.env.APP_NAME}` }],
      workflow,
    };
    return json(data);
  };

  export type ActionData = {
    success?: string;
    error?: string;
    execution?: WorkflowExecutionDto;
  };
  export const action = async ({ request, params }: ActionFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const form = await request.formData();
    const action = form.get("action")?.toString();

    let apiKey: string | null = null;
    if (tenantId === null) {
      apiKey = process.env.API_ACCESS_TOKEN?.toString() || null;
      if (!apiKey) {
        throw new Error(`No API key found`);
      }
    } else {
      const apiKeys = await getApiKeys(tenantId!);
      const validApiKey = apiKeys.find((f) => f.active && (f.expires === null || f.expires > new Date()));
      if (!validApiKey) {
        throw new Error(`No valid API key found`);
      }
      apiKey = validApiKey.key;
    }

    if (action === "execute") {
      try {
        const input = form.get("input")?.toString() ?? "{}";
        const url = `${getBaseURL(request)}/api/workflows/run/${params.id}`;
        const response = await fetch(url, {
          method: "POST",
          body: input,
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
          },
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return json({ execution: data.execution });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } else if (action === "continue-execution") {
      try {
        const executionId = form.get("executionId")?.toString() ?? "";
        const input = form.get("input")?.toString() ?? "{}";
        const url = `${getBaseURL(request)}/api/workflows/executions/${executionId}/continue`;
        const response = await fetch(url, {
          method: "POST",
          body: input,
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
          },
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return json({ execution: data.execution });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    }
    return json({ error: "Invalid action" }, { status: 400 });
  };
}
